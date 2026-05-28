(function (root) {
  "use strict";

  const COMMANDS = new Map([
    ["alpha", "\\alpha"],
    ["beta", "\\beta"],
    ["gamma", "\\gamma"],
    ["delta", "\\delta"],
    ["epsilon", "\\epsilon"],
    ["zeta", "\\zeta"],
    ["eta", "\\eta"],
    ["theta", "\\theta"],
    ["iota", "\\iota"],
    ["kappa", "\\kappa"],
    ["lambda", "\\lambda"],
    ["mu", "\\mu"],
    ["nu", "\\nu"],
    ["xi", "\\xi"],
    ["pi", "\\pi"],
    ["rho", "\\rho"],
    ["sigma", "\\sigma"],
    ["tau", "\\tau"],
    ["upsilon", "\\upsilon"],
    ["phi", "\\phi"],
    ["chi", "\\chi"],
    ["psi", "\\psi"],
    ["omega", "\\omega"],
    ["Gamma", "\\Gamma"],
    ["Delta", "\\Delta"],
    ["Theta", "\\Theta"],
    ["Lambda", "\\Lambda"],
    ["Xi", "\\Xi"],
    ["Pi", "\\Pi"],
    ["Sigma", "\\Sigma"],
    ["Phi", "\\Phi"],
    ["Psi", "\\Psi"],
    ["Omega", "\\Omega"],
    ["infty", "\\infty"],
    ["oo", "\\infty"],
    ["times", "\\times"],
    ["div", "\\div"],
    ["pm", "\\pm"],
    ["neq", "\\ne"],
    ["le", "\\le"],
    ["ge", "\\ge"],
    ["approx", "\\approx"],
    ["rightarrow", "\\rightarrow"],
    ["to", "\\to"],
    ["leftarrow", "\\leftarrow"],
    ["RR", "\\mathbb{R}"],
    ["NN", "\\mathbb{N}"],
    ["ZZ", "\\mathbb{Z}"],
    ["QQ", "\\mathbb{Q}"],
    ["CC", "\\mathbb{C}"],
  ]);

  const FUNCTIONS = new Set([
    "sin",
    "cos",
    "tan",
    "log",
    "ln",
    "exp",
    "lim",
    "min",
    "max",
    "sum",
    "prod",
    "int",
  ]);

  function typstMathToLatex(input) {
    const parser = new Parser(String(input ?? ""));
    const latex = parser.parseExpression(null).trim();
    parser.skipSpaces();

    if (!parser.isEnd()) {
      throw parser.error(`Unexpected token '${parser.peek()}'`);
    }

    return latex;
  }

  class Parser {
    constructor(input) {
      this.input = input;
      this.index = 0;
    }

    parseExpression(stopChar) {
      const parts = [];

      while (!this.isEnd()) {
        this.skipSpaces();

        if (this.isEnd()) {
          break;
        }

        if (stopChar && this.peek() === stopChar) {
          break;
        }

        if (!stopChar && ")]},".includes(this.peek())) {
          throw this.error(`Unexpected '${this.peek()}'`);
        }

        parts.push(this.parseAtomWithScripts());
      }

      return joinParts(parts);
    }

    parseAtomWithScripts() {
      let base = this.parseAtom();

      while (!this.isEnd()) {
        this.skipSpaces();
        const char = this.peek();

        if (char !== "^" && char !== "_") {
          break;
        }

        this.index += 1;
        const script = this.parseScriptArgument();
        base = char === "^" ? `${base}^{${script}}` : `${base}_{${script}}`;
      }

      return base;
    }

    parseAtom() {
      this.skipSpaces();

      if (this.isEnd()) {
        throw this.error("Expected expression");
      }

      const char = this.peek();

      if (char === "(") {
        return this.parseDelimited("(", ")", "(", ")");
      }

      if (char === "[") {
        return this.parseDelimited("[", "]", "[", "]");
      }

      if (char === "{") {
        return this.parseDelimited("{", "}", "\\{", "\\}");
      }

      if (isDigit(char)) {
        return this.readWhile(isDigit);
      }

      if (isIdentifierStart(char)) {
        return this.parseIdentifier();
      }

      const operator = this.parseOperator();

      if (operator) {
        return operator;
      }

      throw this.error(`Unsupported character '${char}'`);
    }

    parseOperator() {
      const twoChar = this.input.slice(this.index, this.index + 2);

      if (twoChar === "<=") {
        this.index += 2;
        return "\\le";
      }

      if (twoChar === ">=") {
        this.index += 2;
        return "\\ge";
      }

      if (twoChar === "!=") {
        this.index += 2;
        return "\\ne";
      }

      if ("+-=*/<>|,!".includes(this.peek())) {
        const char = this.peek();
        this.index += 1;
        return operatorToLatex(char);
      }

      return null;
    }

    parseIdentifier() {
      const name = this.readWhile(isIdentifierPart);
      this.skipSpaces();

      if (name === "sqrt" && this.peek() === "(") {
        this.index += 1;
        const body = this.parseExpression(")");
        this.expect(")");
        return `\\sqrt{${body}}`;
      }

      if (name === "frac" && this.peek() === "(") {
        this.index += 1;
        const numerator = this.parseExpression(",");
        this.expect(",");
        const denominator = this.parseExpression(")");
        this.expect(")");
        return `\\frac{${numerator}}{${denominator}}`;
      }

      if (COMMANDS.has(name)) {
        return COMMANDS.get(name);
      }

      if (FUNCTIONS.has(name)) {
        return `\\${name}`;
      }

      return name;
    }

    parseScriptArgument() {
      this.skipSpaces();

      if (this.peek() === "(") {
        this.index += 1;
        const body = this.parseExpression(")");
        this.expect(")");
        return body;
      }

      if (this.peek() === "[") {
        this.index += 1;
        const body = this.parseExpression("]");
        this.expect("]");
        return body;
      }

      if (this.peek() === "{") {
        this.index += 1;
        const body = this.parseExpression("}");
        this.expect("}");
        return body;
      }

      return this.parseAtom();
    }

    parseDelimited(open, close, latexOpen, latexClose) {
      this.expect(open);
      const body = this.parseExpression(close);
      this.expect(close);
      return `${latexOpen}${body}${latexClose}`;
    }

    expect(char) {
      this.skipSpaces();

      if (this.peek() !== char) {
        throw this.error(`Expected '${char}'`);
      }

      this.index += 1;
    }

    readWhile(predicate) {
      const start = this.index;

      while (!this.isEnd() && predicate(this.peek())) {
        this.index += 1;
      }

      return this.input.slice(start, this.index);
    }

    skipSpaces() {
      while (!this.isEnd() && /\s/.test(this.peek())) {
        this.index += 1;
      }
    }

    peek() {
      return this.input[this.index];
    }

    isEnd() {
      return this.index >= this.input.length;
    }

    error(message) {
      return new Error(`${message} at position ${this.index}`);
    }
  }

  function joinParts(parts) {
    return parts.filter(Boolean).join(" ").replace(/\s+([,;])/g, "$1");
  }

  function operatorToLatex(char) {
    if (char === "*") {
      return "\\cdot";
    }

    return char;
  }

  function isDigit(char) {
    return /[0-9.]/.test(char);
  }

  function isIdentifierStart(char) {
    return /[A-Za-z]/.test(char);
  }

  function isIdentifierPart(char) {
    return /[A-Za-z0-9.]/.test(char);
  }

  root.typstMathToLatex = typstMathToLatex;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { typstMathToLatex };
  }
})(typeof globalThis !== "undefined" ? globalThis : window);
