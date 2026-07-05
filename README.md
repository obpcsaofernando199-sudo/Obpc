# OBPC São Fernando - Sistema de Gestão da Igreja

Site e ferramentas administrativas da Igreja Evangélica Pentecostal O Brasil para Cristo (OBPC), Congregação Jardim São Fernando, em Ferraz de Vasconcelos - SP.

**Site publicado:** obpcsaofernando199-sudo.github.io/Obpc/

## Sobre

Este repositório reúne o site institucional da congregação e um conjunto de painéis e ferramentas internas usadas na administração da igreja, incluindo escala de cultos, avisos, gravação de pregações e comunicados.

## Estrutura principal

**Site institucional**
Página pública com informações da igreja, horários de cultos e contato.

**painel.html**
Painel central que reúne as abas: Info da Igreja, Escala, Avisos e Ferramentas. A aba de banners tem dois blocos separados: "Destaque do Mês" (banner_culto) e "Próximos Cultos" (proximos_cultos).

**escala.html (Escala Pro)**
Ferramenta de escala de cultos e atividades, com sincronização em tempo real via Firebase, ordenação cronológica, filtro por mês e reordenação por arrastar e soltar.

**painel_adm.html**
Painel administrativo com gravação de vídeo (Palavra do Pastor), upload para Cloudinary e envio de notificações push.

**editor_sermoes.html**
Editor de estrutura de sermões, com campos guiados e botões de sugestão para ajudar o pastor a organizar o conteúdo da pregação.

**carta.html**
Editor de cartas-convite da igreja, com pré-visualização, salvamento automático e compartilhamento em PDF ou WhatsApp.

**painel_pessoal.html / index.html**
Painel pessoal com atalhos para as ferramentas de agenda, contratos, financeiro e ministério.

## Tecnologia

- HTML, CSS e JavaScript puro
- Firebase Realtime Database (sincronização de dados)
- Firebase Cloud Messaging (notificações push)
- Cloudinary (armazenamento de vídeos e imagens)
- Hospedagem via GitHub Pages

## Contato da igreja

Telefone: (11) 99350-9109
E-mail: obpcsaofernando199@gmail.com
Endereço: Rua Senador José Ermírio de Moraes, 199, Ferraz de Vasconcelos, SP

## Observação importante

Qualquer alteração neste projeto deve partir sempre do arquivo original já existente. Nunca reescrever do zero — apenas alterar exatamente o que for solicitado.
