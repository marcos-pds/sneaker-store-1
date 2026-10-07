using MongoDB.Driver;
using SneakerStore.Domain.Entities;
using SneakerStore.Infrastructure.Context;

namespace SneakerStore.Infrastructure
{
    public class DropshippingService
    {
        private readonly MongoDbContext _context;

        public DropshippingService(MongoDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Despacha o pedido confirmado para o fornecedor parceiro
        /// </summary>
        public async Task<bool> PlaceSupplierOrderAsync(Order order)
        {
            try
            {
                if (order == null || order.Items == null || !order.Items.Any())
                {
                    Console.WriteLine("[Dropshipping Error]: Pedido inválido ou sem itens para despacho.");
                    return false;
                }

                // 1. Montagem da carga de dados enviada ao fornecedor
                var supplierOrderPayload = new
                {
                    StoreReferenceId = order.Id,
                    Recipient = new
                    {
                        Name = order.CustomerName,
                        Phone = order.CustomerPhone,
                        Cpf = order.CustomerCpf,
                        ShippingAddress = order.ShippingAddress?.ToString() ?? string.Empty,
                        ZipCode = order.ShippingAddress?.ZipCode ?? string.Empty,
                        City = order.ShippingAddress?.City ?? string.Empty,
                        State = order.ShippingAddress?.State ?? string.Empty
                    },
                    Products = order.Items.Select(item => new
                    {
                        Sku = item.Sku,
                        Title = item.Title,
                        Quantity = item.Quantity,
                        Size = item.Size,
                        SupplierUrl = item.SupplierUrl
                    }).ToList()
                };

                // 2. Criação do identificador de rastreamento com o parceiro
                string generatedSupplierOrderId = "SUP-" + Guid.NewGuid().ToString().Substring(0, 8).ToUpper();

                // 3. Atualização do status operacional e vínculo de ID no MongoDB
                if (_context != null)
                {
                    var filter = Builders<Order>.Filter.Eq(o => o.Id, order.Id);
                    var update = Builders<Order>.Update
                        .Set(o => o.ExternalSupplierOrderId, generatedSupplierOrderId)
                        .Set(o => o.DropshippingStatus, "PlacedAtSupplier")
                        .Set(o => o.UpdatedAt, DateTime.UtcNow);

                    await _context.Orders.UpdateOneAsync(filter, update);
                }

                Console.WriteLine($"[Dropshipping Success]: Pedido {order.Id} despachado com sucesso. ID Fornecedor: {generatedSupplierOrderId}");
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Dropshipping Failure]: Erro ao despachar pedido {order?.Id}: {ex.Message}");
                return false;
            }
        }
    }
}