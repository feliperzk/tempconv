# tempconv

Conversor de temperatura entre Celsius (`C`), Fahrenheit (`F`) e Kelvin (`K`). Sem dependências (Node.js).

## Uso da CLI

```bash
node tempconv.js <valor> <origem> <destino>
```

```bash
node tempconv.js 100 C F      # 212.00 F
node tempconv.js 0 C K        # 273.15 K
node tempconv.js 32 F C       # 0.00 C
node tempconv.js 0 K C        # -273.15 C
```

- Saída com 2 casas decimais.
- Unidades em maiúsculo (`C`, `F`, `K`); valores abaixo do zero absoluto (`-273.15 C`, `-459.67 F`, `0 K`) são rejeitados.
- Erros vão para stderr com código de saída `1`.

## Testes

```bash
node --test test.js
```
