# Desbloqueáveis: todas as recompensas únicas dos Pedidos Especiais

## Por quê
O lembrete de segunda ("olhem o quadro de Pedidos Especiais") só conhecia 3 pedidos
(Painel Solar, Moedor de Ossos, Esmagador de Geodos). Faltavam 13 recompensas únicas do
quadro da cidade (wiki 1.6), como o Baú de Pedra da Robin. Algumas nem são máquinas
(cama, aquário, canal de TV), então a seção "Construções e máquinas" vira "Desbloqueáveis",
com categorias.

## Objetivos
- Toda recompensa única do quadro da cidade aparece na seção e, marcada como "Queremos",
  entra no lembrete de segunda com o pedido, quem pede, o objetivo e o prazo.
- A seção se chama "Desbloqueáveis" e mostra subtítulos por categoria, cada um com "X de Y".
- Nada do que os jogadores já marcaram se perde (os ids internos não mudam).

## Fora do escopo
- Pedidos do Sr. Qi (dão gemas do Qi, não itens únicos).
- Recompensas só em ouro, amizade ou cena.

## Abordagens consideradas
- A) Pôr tudo na lista atual "Construções e máquinas". Simples, mas cama e TV ficam fora de lugar.
- B) Seção nova só para recompensas de pedidos. Duplica a lógica e separa os 3 já existentes.
- C) Dividir receitas e itens prontos em lugares diferentes. Lógica do quadro em dois lugares.
- **Escolhida (pedido do usuário):** renomear a seção para "Desbloqueáveis" e agrupar por
  categoria. Mantém tudo num lugar só e resolve o "fora de lugar" de A.

## Categorias (campo `cat` em cada item de BUILD)
| cat | Título | Itens |
|---|---|---|
| constr | Construções | Silo, Estábulo, Lago de peixes, Moinho, Poço, Casa de Gosmas, Tigela, Obeliscos, Cabana dos Junimos, Relógio Dourado |
| maq | Máquinas | máquinas de produção (maionese … Máquina de Iscas, menos as de pesca), Painel Solar, Moedor, Esmagador |
| anim | Animais | Balde, Tesoura, Aquecedor, Auto-Recolhedora, Auto-Acariciador, Incubador de Gosmas, Incubadora de Avestruzes, Prensa de Gosmas |
| pesca | Pesca | Cesto de Minhocas (e de Luxo), Máquina de Iscas, Defumador, **Boia de Qualidade** |
| util | Utilidades | Para-raios, **Baú de Pedra**, **Mini-Geladeira**, **Mini-Caixa de Envio**, **Computador da Fazenda**, **Mini-Obelisco**, **Máquina de Costura**, **Cafeteira** |
| deco | Decoração | **Cama de casal vermelha de luxo**, **Aquário de luxo** |
| outros | Outros | **Canal de TV F.I.B.S.**, **Sementes de Fibra**, **Almíscar de Monstro** |

## Novos itens (wiki 1.6)
| Item | Pedido (quem, prazo) | Tipo | Condição | Materiais |
|---|---|---|---|---|
| Baú de Pedra | Corrida de Recursos (Robin, 7) | receita | — | 50 pedra |
| Cama de casal vermelha de luxo | O Projeto da Robin (Robin, 7) | fica à venda na Robin | — | — |
| Computador da Fazenda | Superpopulação Aquática e Equilíbrio do Bioma (Demetrius, 7) | receita | — | 1 engenhoca anã, 1 conjunto de pilhas, 10 quartzos refinados |
| Máquina de Costura | Rejuvenescimento das Pedras (Emily, 7) | item | acesso à máquina da Emily (só no texto) | — |
| Cafeteira | Presentes para o George (Evelyn, 28) | item | primavera | — |
| Mini-Geladeira | Omelete Famosa do Gus (Gus, 14) | item | — | — |
| Mini-Caixa de Envio | Pedido de Colheita (Lewis, 28) ou Produtos de Primeira (Pierre, 28) | item | Lewis: fora do inverno | — |
| Sementes de Fibra | Limpeza Comunitária (Linus, 7) | receita de uso | — | 1 semente mista, 5 seivas, 1 argila |
| Boia de Qualidade | Os Insetos Suculentos (Willy, 7) | receita de uso | — | 1 barra de cobre, 20 seivas, 5 essências solares |
| Aquário de luxo | Peixes Tropicais (Willy, 7) | item | Ilha liberada (Resort citado no texto) | — |
| Mini-Obelisco | Uma Substância Curiosa (Feiticeiro, 7) | receita | — | 30 madeiras de lei, 20 essências solares, 3 barras de ouro |
| Almíscar de Monstro | Geleia Prismática (Feiticeiro, 7) | receita de uso | — | 30 asas de morcego, 30 gosmas |
| Canal de TV F.I.B.S. | Coisa Forte (Pam, 14) | item | primavera | — |

## Como funciona
- `so` pode ser um pedido ou uma lista de pedidos. Cada pedido tem `req(c)` opcional (recebe o dia).
- Tipos:
  - **receita** (padrão, como hoje): opções Queremos / Temos a receita / Já temos / Não queremos.
    Com a receita, vira tarefa "Fazer X".
  - **item** (`item:1`): chega pronto. Opções Queremos / Já temos / Não queremos. Nunca vira tarefa de fazer.
  - **receita de uso** (`uso:1`): consumível. Ter a receita já conta como "temos". Opções
    Queremos / Temos a receita / Não queremos.
- Lembrete de segunda: lista um pedido por linha, com "Recompensa: receita de X" ou "Recompensa: X".
  Só entra pedido cuja condição vale hoje e cujo item está em "Queremos".
- Textos que diziam "Construções e máquinas" passam a dizer "Desbloqueáveis".

## Decisões do construtor (não perguntadas)
- Sem estado novo para o Resort nem para a máquina da Emily: as condições aparecem só no texto.
- Subtítulos dentro da mesma seção, não abas.
- O contador do topo continua contando todos os itens, menos galinheiro e celeiro.
