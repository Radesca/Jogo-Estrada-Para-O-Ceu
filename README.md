# Estrada para o Céu: Carlo Acutis Adventure

Jogo web de corrida infinita (*runner*) em pixel art. Carlo Acutis corre pela estrada, pula ou se abaixa para desviar dos **pecados capitais** e coleta **itens de fé** para somar pontos.

**Demo:** https://estrada-para-o-ceu.vercel.app

Sem dependências e sem build: HTML, CSS e JavaScript puros, desenhado em `<canvas>`.

## Como jogar

| Ação | Teclado | Celular |
|---|---|---|
| Pular | Espaço ou seta para cima | botão da direita |
| Abaixar | seta para baixo | botão da esquerda |

- **Pule** Ira, Ganância, Vaidade, Preguiça e Gula.
- **Abaixe-se** para passar por baixo de Inveja e Luxúria.
- **Colete** terço, cruz, hóstia, pomba, livro e notebook para ganhar pontos.
- **Combo:** pegue itens em sequência, sem deixar nenhum passar, para multiplicar os pontos.
- A velocidade aumenta com o tempo e com a pontuação. O recorde fica salvo no navegador.

## Placar online (opcional)

O placar usa o [Supabase](https://supabase.com). Sem configuração o jogo funciona normalmente, só o placar fica desligado.

1. Crie um projeto gratuito no Supabase e uma tabela `scores` com as colunas `name` (texto), `instagram` (texto) e `score` (inteiro).
2. Em `game.js`, preencha `SUPABASE_URL_RAW` e `SUPABASE_ANON_KEY` com a URL e a chave `anon public` do projeto.
3. Ative as regras de acesso (RLS) da tabela para permitir só leitura e inserção.

> Não publique chaves reais em um repositório público sem as regras de acesso configuradas.

## Como rodar

Abra o `index.html` no navegador, ou sirva a pasta por HTTP:

```bash
npx serve .
```

## Estrutura

```
index.html   telas (início, regras, fim de jogo, placar)
style.css    estilos
game.js      loop do jogo, colisões, combo, placar
img/         sprites, itens, fundo e capas
```
