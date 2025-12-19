# Teste PIX em Produção - Guia Completo

## 🎯 Objetivo
Testar pagamentos PIX reais em produção com valor baixo (R$ 2,00) para validar a integração com MercadoPago.

## 🛠️ Scripts Disponíveis

### 1. Resetar Ambiente de Teste
```bash
node backend/src/scripts/resetTestEnvironment.js
```
**O que faz:**
- Remove apostilas de teste existentes
- Remove compras de teste do banco
- Remove apostilas de teste dos usuários
- Cria nova apostila de teste limpa
- **Use sempre antes de testar**

### 2. Limpar Apenas Compras de Teste
```bash
node backend/src/scripts/cleanTestPurchases.js
```
**O que faz:**
- Remove apenas as compras de apostilas de teste
- Mantém a apostila de teste
- Remove apostilas de teste dos usuários

### 3. Criar/Verificar Apostila de Teste
```bash
node backend/src/scripts/addTestApostilaProd.js
```
**O que faz:**
- Verifica se existe apostila de teste
- Cria nova se não existir
- Mostra informações da apostila existente

## 🔧 Alterações Feitas no Código

### 1. Correção do Valor PIX
- **Problema:** Código estava gerando valor aleatório (R$ 5-25) em vez de usar preço da apostila
- **Solução:** Removido código que alterava o valor, agora usa `apostila.price` (R$ 2,00)

### 2. Remoção de Bloqueios para Teste
- **Problema:** Sistema bloqueava PIX já utilizados e compras duplicadas
- **Solução:** 
  - Removidos bloqueios específicos de IDs problemáticos
  - Permitida recompra de apostilas de teste (título contém "TESTE")
  - Verificação de duplicatas desabilitada para testes

### 3. Verificações Ajustadas
- Apostilas com "TESTE" no título podem ser recompradas
- Compras duplicadas permitidas para pagamentos de teste
- Bloqueios removidos para ambiente de teste

## 📋 Fluxo de Teste Recomendado

### Antes de Cada Teste:
1. Execute o reset do ambiente:
   ```bash
   node backend/src/scripts/resetTestEnvironment.js
   ```

### Durante o Teste:
1. Acesse a aplicação
2. Encontre a apostila "TESTE PRODUÇÃO - Validação PIX Real - R$ 2,00"
3. Clique em comprar
4. Escolha PIX como método de pagamento
5. **Verifique se o valor é R$ 2,00**
6. Escaneie o QR Code ou copie o código PIX
7. Faça o pagamento real
8. Aguarde a confirmação

### Após o Teste:
- O pagamento deve ser processado normalmente
- A apostila deve aparecer na biblioteca do usuário
- Você pode executar o reset novamente para novos testes

## 🚨 Importante

- **Valor Real:** Os testes usam PIX real com valor de R$ 2,00
- **Ambiente:** Funciona em produção com credenciais reais do MercadoPago
- **Limpeza:** Sempre execute o reset antes de novos testes
- **Múltiplos Testes:** Você pode testar quantas vezes quiser com o mesmo usuário

## 🔍 Verificações de Sucesso

✅ **PIX gerado com R$ 2,00** (não R$ 16,00 ou outro valor)  
✅ **QR Code funcional** (pode ser escaneado)  
✅ **Pagamento processado** (webhook recebido)  
✅ **Apostila liberada** (aparece na biblioteca)  
✅ **Pode testar novamente** (sem bloqueios)  

## 🛟 Solução de Problemas

### "Você já possui esta apostila"
```bash
node backend/src/scripts/resetTestEnvironment.js
```

### "PIX já foi utilizado"
```bash
node backend/src/scripts/resetTestEnvironment.js
```

### Valor errado no PIX
- Verifique se as alterações no código foram aplicadas
- Execute o reset do ambiente
- Teste novamente

### PIX não funciona
- Verifique credenciais do MercadoPago no .env
- Confirme que PIX está habilitado na conta MercadoPago
- Teste com credenciais de sandbox primeiro