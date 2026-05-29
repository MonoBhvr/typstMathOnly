# Typst Math to KaTeX

Typst 스타일 수식 입력을 KaTeX가 렌더링할 수 있는 LaTeX 문자열로 변환하는 정적 HTML/JavaScript 도구입니다.

이 저장소는 이제 Typst 컴파일러 전체가 아니라, 브라우저에서 바로 실행되는 수식 변환 기능만을 목적으로 합니다. Rust 빌드, Typst 평가기, 레이아웃 엔진, 패키지 실행 기능은 포함하지 않습니다.

## Files

- `typst-math.html` - 수식 입력, LaTeX 출력, KaTeX 미리보기를 제공하는 정적 페이지
- `typst-math.js` - Typst 스타일 수식 문법을 KaTeX 호환 LaTeX로 변환하는 로직
- `typst-math.test.html` - 브라우저에서 실행할 수 있는 변환 테스트 페이지

## Usage

브라우저에서 `typst-math.html`을 직접 열면 됩니다. 또는 정적 서버로 띄울 수 있습니다.

```sh
python3 -m http.server 8000
```

그 다음 아래 주소를 엽니다.

```text
http://127.0.0.1:8000/typst-math.html
```

KaTeX는 CDN에서 불러오므로 렌더링에는 네트워크 연결이 필요합니다.

## Supported Scope

지원하는 것은 Typst 수학 기능 전체가 아니라, KaTeX 렌더링을 위한 문법 전용 변환 subset입니다.

지원 예시:

- 첨자/윗첨자: `x_1^2`
- 프라임: `f''`
- 분수: `a / b`, `frac(a, b)`
- 루트: `sqrt(x)`, `root(3, x)`, `√x`, `∛x`, `∜x`
- 기호와 shorthand: `phi.alt`, `plus.minus`, `a -> b`, `a := b`, `[|x|]`
- 일부 구조: `binom`, `vec`, `mat`, `cases`, accent 함수, `op`, `underover`

지원하지 않는 것:

- `#` 코드 실행, `#let`, 변수/함수 평가
- `set`, `show`, 패키지, 커스텀 함수 실행
- spread args `..xs`
- named args 전체
- Typst와 동일한 정밀 레이아웃 및 스타일링

## Tests

정적 서버를 띄운 뒤 테스트 페이지를 엽니다.

```sh
python3 -m http.server 8000
```

```text
http://127.0.0.1:8000/typst-math.test.html
```

별도의 빌드 단계나 패키지 설치는 없습니다.

## License

포함된 라이선스 파일을 참고하세요.
