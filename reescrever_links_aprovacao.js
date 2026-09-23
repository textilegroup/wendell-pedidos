/* ──────────────────────────────────────────────────────────────
   REESCREVER O LINK DE APROVAÇÃO NOS DEALS AINDA ABERTOS
   ──────────────────────────────────────────────────────────────
   Como usar:
   1. Abra https://textilegroup.github.io/wendell-pedidos/
   2. F12 → aba Console
   3. Cole este bloco inteiro e dê Enter
   4. Acompanhe o relatório; no fim ele diz quantos foram trocados

   Só mexe no campo do link (ufCrm29_1780925422). Não toca em
   assinaturas, etapas, valores nem em nada do pedido.
   ────────────────────────────────────────────────────────────── */
(async () => {
  const CAMPO_LINK = 'ufCrm29_1780925422';
  const base = urlDesteApp();
  if (!base) { console.error('Abra pela URL publicada, não por arquivo local.'); return; }

  console.log('Novo endereço base:', base);
  const pedidos = await sbFetch('pedidos?status=eq.pendente&select=bitrix_deal_id,numero_pedido&limit=500');
  const deals = [...new Set((pedidos || []).map(p => p.bitrix_deal_id).filter(Boolean))];
  console.log('Pedidos pendentes com Deal:', deals.length);

  let trocados = 0, jaOk = 0, erros = 0;
  for (const id of deals) {
    const novo = base + '?dealId=' + id;
    try {
      const r = await bxCall('crm.item.get', { entityTypeId: BX_TYPE_ID, id: parseInt(id) });
      const atual = (r && r.item && r.item[CAMPO_LINK]) || '';
      if (atual === novo) { jaOk++; continue; }
      const f = {}; f[CAMPO_LINK] = novo;
      await bxCall('crm.item.update', { entityTypeId: BX_TYPE_ID, id: parseInt(id), fields: f });
      trocados++;
      console.log('  #' + id + '  ' + (atual || '(vazio)') + '  →  ' + novo);
    } catch (e) {
      erros++;
      console.error('  #' + id + ' erro:', e.message);
    }
  }
  console.log('\nRESULTADO — trocados: %s | já corretos: %s | com erro: %s', trocados, jaOk, erros);
})();
