using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using SneakerStore.Domain.Entities;
using SneakerStore.Infrastructure.Context;

namespace SneakerStore.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrderController : ControllerBase
    {
        private readonly MongoDbContext _context;

        public OrderController(MongoDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] Order order)
        {
            try
            {
                if (order == null)
                    return BadRequest(new { message = "Dados do pedido inválidos." });

                order.CreatedAt = DateTime.UtcNow;
                if (string.IsNullOrEmpty(order.PaymentStatus))
                {
                    order.PaymentStatus = "Pending";
                }

                // Insere o pedido diretamente na coleção Orders do MongoDB
                await _context.Orders.InsertOneAsync(order);

                return Ok(new
                {
                    id = order.Id,
                    customerName = order.CustomerName,
                    customerEmail = order.CustomerEmail,
                    totalAmount = order.TotalAmount,
                    paymentStatus = order.PaymentStatus,
                    createdAt = order.CreatedAt
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[MongoDB Order Error]: {ex.Message}");
                return StatusCode(500, new { message = "Erro ao salvar pedido no MongoDB.", detail = ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAllOrders()
        {
            try
            {
                var orders = await _context.Orders.Find(_ => true).ToListAsync();
                return Ok(orders);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro ao buscar pedidos.", detail = ex.Message });
            }
        }
    }
}