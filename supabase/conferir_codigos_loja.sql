-- ============================================================
-- 🔍 CONFERIR FORMATO DOS CÓDIGOS DE LOJA
-- ------------------------------------------------------------
-- Rode no SQL Editor do Supabase ANTES de importar os dados.
-- Mostra como os códigos estão guardados (com ou sem zero à esquerda).
-- ============================================================

-- Mostra os códigos das lojas do Painel de Ouro, em ordem
select codigo, nome
from public.painel_ouro_lojas
order by codigo;

-- Foca nas lojas-chave da importação: aparecem como '44' ou '044'?
select codigo, nome
from public.painel_ouro_lojas
where codigo in ('44','044','46','046','76','076','83','083','91','091')
order by codigo;

-- Conta quantos códigos têm zero à esquerda (se vier > 0, o banco usa zero)
select
  count(*) filter (where codigo like '0%') as com_zero_esquerda,
  count(*) filter (where codigo not like '0%') as sem_zero_esquerda,
  count(*) as total
from public.painel_ouro_lojas;
