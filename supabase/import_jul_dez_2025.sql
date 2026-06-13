-- ============================================================
-- 📥 IMPORTAÇÃO CONSOLIDADA — consolidado — 2025 (jul-dez)
-- 168 registros (28 lojas × 6 meses)
-- Máxima por mês: 100  ← confira antes de rodar!
-- ⚠️ Este script APAGA as áreas detalhadas de jul-dez/2025 e as
--    substitui pelo total consolidado. Tudo numa transação.
-- ============================================================

begin;

-- 0) garante que a área "consolidado" existe em painel_ouro_areas (FK)
--    peso_maximo = 100 (nota mensal de 0 a 100); ordem 99 = por último
insert into public.painel_ouro_areas (slug, nome, peso_maximo, ordem, ativo)
values ('consolidado', 'Consolidado', 100, 99, true)
on conflict (slug) do nothing;

-- 1) remove os lançamentos por área de jul-dez/2025
--    (todas as áreas, exceto um consolidado que já exista)
delete from public.painel_ouro_resultados
where ano = 2025 and mes between 7 and 12 and area_slug <> 'consolidado';

-- 2) importa o consolidado (total por loja/mês)
with dados(cod, mes, obtido) as (
  values
    ('44', 7, 36.5),
    ('44', 8, 40),
    ('44', 9, 26.5),
    ('44', 10, 26.5),
    ('44', 11, 55.5),
    ('44', 12, 65.5),
    ('46', 7, 43),
    ('46', 8, 43.5),
    ('46', 9, 36.5),
    ('46', 10, 69.5),
    ('46', 11, 55),
    ('46', 12, 48.5),
    ('76', 7, 34.5),
    ('76', 8, 49),
    ('76', 9, 40),
    ('76', 10, 26.5),
    ('76', 11, 67),
    ('76', 12, 54),
    ('77', 7, 26),
    ('77', 8, 37.5),
    ('77', 9, 33),
    ('77', 10, 58.5),
    ('77', 11, 43.5),
    ('77', 12, 64),
    ('83', 7, 18),
    ('83', 8, 40.5),
    ('83', 9, 41),
    ('83', 10, 62),
    ('83', 11, 51.5),
    ('83', 12, 44),
    ('91', 7, 26),
    ('91', 8, 46),
    ('91', 9, 41),
    ('91', 10, 61),
    ('91', 11, 64),
    ('91', 12, 56),
    ('107', 7, 36.5),
    ('107', 8, 43),
    ('107', 9, 27),
    ('107', 10, 68),
    ('107', 11, 44),
    ('107', 12, 62),
    ('109', 7, 32),
    ('109', 8, 46.5),
    ('109', 9, 43),
    ('109', 10, 39.5),
    ('109', 11, 65),
    ('109', 12, 48),
    ('114', 7, 22.5),
    ('114', 8, 42),
    ('114', 9, 36.5),
    ('114', 10, 35),
    ('114', 11, 69),
    ('114', 12, 52.5),
    ('119', 7, 47),
    ('119', 8, 34),
    ('119', 9, 23.5),
    ('119', 10, 59.5),
    ('119', 11, 44),
    ('119', 12, 66.5),
    ('120', 7, 26),
    ('120', 8, 44),
    ('120', 9, 41.5),
    ('120', 10, 65),
    ('120', 11, 56),
    ('120', 12, 67.5),
    ('138', 7, 40),
    ('138', 8, 67),
    ('138', 9, 60.5),
    ('138', 10, 57.5),
    ('138', 11, 43.5),
    ('138', 12, 35.5),
    ('152', 7, 45),
    ('152', 8, 47),
    ('152', 9, 55),
    ('152', 10, 55.5),
    ('152', 11, 40),
    ('152', 12, 45),
    ('163', 7, 31),
    ('163', 8, 47.5),
    ('163', 9, 50),
    ('163', 10, 41),
    ('163', 11, 46.5),
    ('163', 12, 48),
    ('179', 7, 38),
    ('179', 8, 43.5),
    ('179', 9, 38),
    ('179', 10, 26),
    ('179', 11, 42.5),
    ('179', 12, 43),
    ('198', 7, 26),
    ('198', 8, 42),
    ('198', 9, 31),
    ('198', 10, 31.5),
    ('198', 11, 41),
    ('198', 12, 39),
    ('204', 7, 26.5),
    ('204', 8, 31.5),
    ('204', 9, 39),
    ('204', 10, 34),
    ('204', 11, 43),
    ('204', 12, 48),
    ('207', 7, 35),
    ('207', 8, 42.5),
    ('207', 9, 21),
    ('207', 10, 56),
    ('207', 11, 33.5),
    ('207', 12, 38),
    ('238', 7, 18.5),
    ('238', 8, 29.5),
    ('238', 9, 32),
    ('238', 10, 57.5),
    ('238', 11, 70),
    ('238', 12, 65),
    ('262', 7, 42),
    ('262', 8, 30),
    ('262', 9, 54),
    ('262', 10, 52),
    ('262', 11, 50.5),
    ('262', 12, 59),
    ('268', 7, 25.5),
    ('268', 8, 48),
    ('268', 9, 39.5),
    ('268', 10, 39),
    ('268', 11, 63.5),
    ('268', 12, 53.5),
    ('284', 7, 57.5),
    ('284', 8, 42),
    ('284', 9, 49),
    ('284', 10, 55),
    ('284', 11, 61.5),
    ('284', 12, 57),
    ('289', 7, 39.5),
    ('289', 8, 50),
    ('289', 9, 66.5),
    ('289', 10, 62),
    ('289', 11, 41.5),
    ('289', 12, 44.5),
    ('290', 7, 34),
    ('290', 8, 32.5),
    ('290', 9, 33),
    ('290', 10, 54),
    ('290', 11, 38),
    ('290', 12, 72),
    ('298', 7, 36.5),
    ('298', 8, 47),
    ('298', 9, 37.5),
    ('298', 10, 48.5),
    ('298', 11, 46),
    ('298', 12, 41.5),
    ('300', 7, 38.5),
    ('300', 8, 54),
    ('300', 9, 48.5),
    ('300', 10, 55.5),
    ('300', 11, 72.5),
    ('300', 12, 49.5),
    ('305', 7, 64),
    ('305', 8, 46),
    ('305', 9, 62),
    ('305', 10, 57.5),
    ('305', 11, 36.5),
    ('305', 12, 69),
    ('333', 7, 39.5),
    ('333', 8, 45),
    ('333', 9, 39),
    ('333', 10, 59.5),
    ('333', 11, 60.5),
    ('333', 12, 65)
),
-- resolve o código real da loja no banco (com ou sem zero à esquerda)
resolvido as (
  select l.codigo as loja_codigo, d.mes, d.obtido
  from dados d
  join public.painel_ouro_lojas l
    on ltrim(l.codigo, '0') = ltrim(d.cod, '0')
)
insert into public.painel_ouro_resultados
  (loja_codigo, area_slug, ano, mes, pontuacao_obtida, pontuacao_maxima, sub_resultados, ativo)
select
  r.loja_codigo, 'consolidado', 2025, r.mes, r.obtido, 100,
  jsonb_build_array(jsonb_build_object(
    'indicador','total','resultado',r.obtido,'Ponto',100,'pontos',r.obtido)),
  true
from resolvido r
on conflict (loja_codigo, area_slug, ano, mes)
do update set
  pontuacao_obtida = excluded.pontuacao_obtida,
  pontuacao_maxima = excluded.pontuacao_maxima,
  sub_resultados   = excluded.sub_resultados,
  ativo = true;

-- 3) confira o resultado ANTES de confirmar:
select mes, count(*) as lojas, round(sum(pontuacao_obtida)::numeric,1) as total_obtido
from public.painel_ouro_resultados
where ano = 2025 and area_slug = 'consolidado'
group by mes order by mes;

-- Se os números acima baterem com o esperado, confirme:
commit;
-- Se algo estiver errado, rode em vez disso:  rollback;

-- conferência extra: total por loja (deve bater com a coluna TOTAL PONTOS)
-- select loja_codigo, round(sum(pontuacao_obtida)::numeric,1) total
-- from public.painel_ouro_resultados
-- where ano = 2025 and area_slug = 'consolidado' group by loja_codigo order by total desc;
