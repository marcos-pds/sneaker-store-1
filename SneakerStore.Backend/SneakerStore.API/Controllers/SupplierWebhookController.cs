using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using SneakerStore.Domain.DTOs;
using SneakerStore.Domain.Entities;
using SneakerStore.Infrastructure.Context;

namespace SneakerStore.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SupplierWebhookController : ControllerBase
    {
        private readonly MongoDbContext _context;

        public SupplierWebhookController(MongoDbContext context)
        {
            _context = context;
        }

        // POST: api/supplierwebhook/tracking-update
        [HttpPost("tracking-update")]
        public async Task<IActionResult> UpdateTracking([FromBody] TrackingUpdateDto request)
        {
            if (string.IsNullOrEmpty(request.ExternalSupplierOrderId) || string.IsNullOrEmpty(request.TrackingCode))
            {
                return BadRequest(new { message = "Dados de rastreamento incompletos." });
            }

            try
            {
                var filter = Builders<Order>.Filter.Eq(o => o.ExternalSupplierOrderId, request.ExternalSupplierOrderId);
                var update = Builders<Order>.Update
                    .Set(o => o.TrackingCode, request.TrackingCode)
                    .Set(o => o.Carrier, string.IsNullOrWhiteSpace(request.Carrier) ? "Correios" : request.Carrier)
                    .Set(o => o.DropshippingStatus, "Shipped")
                    .Set(o => o.UpdatedAt, DateTime.UtcNow);

                var result = await _context.Orders.UpdateOneAsync(filter, update);

                if (result.MatchedCount == 0)
                {
                    return NotFound(new { message = "Pedido do fornecedor não encontrado no sistema." });
                }

                Console.WriteLine($"[Tracking Updated]: Pedido com ID do fornecedor {request.ExternalSupplierOrderId} atualizado para Shipped com rastreio {request.TrackingCode}");

                return Ok(new { message = "Código de rastreio vinculado com sucesso!", trackingCode = request.TrackingCode });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro ao atualizar rastreamento.", detail = ex.Message });
            }
        }
    }
}