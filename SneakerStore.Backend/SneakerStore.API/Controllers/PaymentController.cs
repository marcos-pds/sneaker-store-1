using Microsoft.AspNetCore.Mvc;
using MercadoPago.Config;
using MercadoPago.Client.Payment;
using MercadoPago.Resource.Payment;
using MongoDB.Driver;
using SneakerStore.Domain.DTOs;
using SneakerStore.Domain.Entities;
using SneakerStore.Infrastructure.Context;
using SneakerStore.Infrastructure;

namespace SneakerStore.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentController : ControllerBase
    {
        private readonly MongoDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly DropshippingService _dropshippingService;

        public PaymentController(
            MongoDbContext context,
            IConfiguration configuration,
            DropshippingService dropshippingService)
        {
            _context = context;
            _configuration = configuration;
            _dropshippingService = dropshippingService;

            var token = _configuration["MercadoPago:AccessToken"];
            if (!string.IsNullOrEmpty(token))
            {
                MercadoPagoConfig.AccessToken = token;
            }
        }

        // POST: api/payment/create-pix
        [HttpPost("create-pix")]
        public async Task<IActionResult> CreatePixPayment([FromBody] PaymentRequestDto request)
        {
            try
            {
                if (request == null || request.Amount <= 0)
                {
                    return BadRequest(new { message = "Valor total do pagamento é inválido." });
                }

                string payerEmail = string.IsNullOrWhiteSpace(request.CustomerEmail)
                    ? "comprador.teste@email.com"
                    : request.CustomerEmail.Trim();

                string cleanCpf = new string((request.CustomerCpf ?? "").Where(char.IsDigit).ToArray());
                if (cleanCpf.Length != 11)
                {
                    cleanCpf = "19100000000";
                }

                string fullName = string.IsNullOrWhiteSpace(request.CustomerName) ? "Marcos Silva" : request.CustomerName.Trim();
                string[] nameParts = fullName.Split(' ', StringSplitOptions.RemoveEmptyEntries);

                string firstName = nameParts.Length > 0 ? nameParts[0] : "Marcos";
                string lastName = nameParts.Length > 1 ? string.Join(" ", nameParts.Skip(1)) : "Silva";

                var client = new PaymentClient();

                var paymentRequest = new PaymentCreateRequest
                {
                    TransactionAmount = request.Amount,
                    Description = $"Pedido Fluxo Sneakers #{request.OrderId}",
                    PaymentMethodId = "pix",
                    Payer = new PaymentPayerRequest
                    {
                        Email = payerEmail,
                        FirstName = firstName,
                        LastName = lastName,
                        Identification = new MercadoPago.Client.Common.IdentificationRequest
                        {
                            Type = "CPF",
                            Number = cleanCpf
                        }
                    }
                };

                Payment payment = await client.CreateAsync(paymentRequest);

                // Atualização no MongoDB com método PIX e cálculo inicial de lucro
                try
                {
                    if (!string.IsNullOrEmpty(request.OrderId) && _context != null)
                    {
                        decimal totalFee = payment.FeeDetails?.Sum(f => f.Amount ?? 0m) ?? 0m;
                        decimal netAmount = payment.TransactionAmount.HasValue ? (payment.TransactionAmount.Value - totalFee) : request.Amount;

                        var existingOrder = await _context.Orders.Find(o => o.Id == request.OrderId).FirstOrDefaultAsync();
                        decimal totalCost = existingOrder?.Items?.Sum(i => i.CostPrice * i.Quantity) ?? 0m;
                        decimal netProfit = netAmount - totalCost;

                        var filter = Builders<Order>.Filter.Eq(o => o.Id, request.OrderId);
                        var update = Builders<Order>.Update
                            .Set(o => o.ExternalPaymentId, payment.Id.ToString())
                            .Set(o => o.PaymentStatus, "Pending")
                            .Set(o => o.PaymentMethod, "PIX")
                            .Set(o => o.CardBrand, null)
                            .Set(o => o.Installments, 1)
                            .Set(o => o.GatewayFee, totalFee)
                            .Set(o => o.NetReceivedAmount, netAmount)
                            .Set(o => o.TotalCostPrice, totalCost)
                            .Set(o => o.NetProfit, netProfit)
                            .Set(o => o.UpdatedAt, DateTime.UtcNow);

                        await _context.Orders.UpdateOneAsync(filter, update);
                    }
                }
                catch (Exception dbEx)
                {
                    Console.WriteLine($"[MongoDB Warning]: {dbEx.Message}");
                }

                return Ok(new
                {
                    paymentId = payment.Id.ToString(),
                    qrCodeBase64 = payment.PointOfInteraction?.TransactionData?.QrCodeBase64 ?? string.Empty,
                    qrCodeCopyPaste = payment.PointOfInteraction?.TransactionData?.QrCode ?? string.Empty,
                    status = payment.Status
                });
            }
            catch (MercadoPago.Error.MercadoPagoApiException mpEx)
            {
                string errorDetail = mpEx.ApiResponse?.Content ?? mpEx.Message;
                Console.WriteLine($"[MercadoPago API Exception]: {errorDetail}");
                return StatusCode(500, new
                {
                    message = "Erro de validação no Mercado Pago.",
                    detail = errorDetail
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[General Error]: {ex.Message}");
                return StatusCode(500, new
                {
                    message = "Erro interno ao processar pagamento.",
                    detail = ex.Message
                });
            }
        }

        // POST: api/payment/create-card
        [HttpPost("create-card")]
        public async Task<IActionResult> CreateCardPayment([FromBody] CardPaymentRequestDto request)
        {
            try
            {
                if (request == null || request.Amount <= 0)
                {
                    return BadRequest(new { message = "Dados da transação inválidos." });
                }

                string cleanCardNumber = new string((request.CardNumber ?? "").Where(char.IsDigit).ToArray());
                string cleanCpf = new string((request.CustomerCpf ?? "").Where(char.IsDigit).ToArray());
                if (cleanCpf.Length != 11) cleanCpf = "19100000000";

                string cardTokenId = string.Empty;

                // Tokenização direta via SDK do Mercado Pago no Backend
                try
                {
                    var tokenClient = new MercadoPago.Client.CardToken.CardTokenClient();
                    var tokenRequest = new MercadoPago.Client.CardToken.CardTokenRequest
                    {
                        CardNumber = cleanCardNumber,
                        ExpirationMonth = int.Parse(string.IsNullOrWhiteSpace(request.ExpirationMonth) ? "11" : request.ExpirationMonth),
                        ExpirationYear = int.Parse(string.IsNullOrWhiteSpace(request.ExpirationYear) ? "2030" : request.ExpirationYear),
                        SecurityCode = string.IsNullOrWhiteSpace(request.SecurityCode) ? "123" : request.SecurityCode,
                        Cardholder = new()
                        {
                            Name = string.IsNullOrWhiteSpace(request.CardholderName) ? "APRO SILVA" : request.CardholderName.ToUpper(),
                            Identification = new MercadoPago.Client.Common.IdentificationRequest
                            {
                                Type = "CPF",
                                Number = cleanCpf
                            }
                        }
                    };

                    var cardToken = await tokenClient.CreateAsync(tokenRequest);
                    cardTokenId = cardToken.Id;
                }
                catch (Exception tokenEx)
                {
                    Console.WriteLine($"[Token Creation Error]: {tokenEx.Message}");
                    return BadRequest(new { message = "Erro ao tokenizar cartão no Mercado Pago.", detail = tokenEx.Message });
                }

                var client = new PaymentClient();

                string payerEmail = string.IsNullOrWhiteSpace(request.CustomerEmail)
                    ? "comprador.teste@email.com"
                    : request.CustomerEmail.Trim();

                string methodId = string.IsNullOrEmpty(request.PaymentMethodId) ? "master" : request.PaymentMethodId;

                var paymentRequest = new PaymentCreateRequest
                {
                    TransactionAmount = request.Amount,
                    Token = cardTokenId,
                    Description = $"Pedido Fluxo Sneakers #{request.OrderId}",
                    Installments = request.Installments <= 0 ? 1 : request.Installments,
                    PaymentMethodId = methodId,
                    Payer = new PaymentPayerRequest
                    {
                        Email = payerEmail,
                        FirstName = "APRO",
                        LastName = "SILVA",
                        Identification = new MercadoPago.Client.Common.IdentificationRequest
                        {
                            Type = "CPF",
                            Number = cleanCpf
                        }
                    }
                };

                Payment payment = await client.CreateAsync(paymentRequest);

                // Grava no MongoDB e dispara o Dropshipping se aprovado
                try
                {
                    if (!string.IsNullOrEmpty(request.OrderId) && _context != null)
                    {
                        string status = payment.Status == "approved" ? "Paid" : payment.Status;
                        string brand = string.IsNullOrEmpty(payment.PaymentMethodId) ? methodId : payment.PaymentMethodId;

                        decimal totalFee = payment.FeeDetails?.Sum(f => f.Amount ?? 0m) ?? 0m;
                        decimal netAmount = payment.TransactionAmount.HasValue ? (payment.TransactionAmount.Value - totalFee) : request.Amount;

                        var existingOrder = await _context.Orders.Find(o => o.Id == request.OrderId).FirstOrDefaultAsync();
                        decimal totalCost = existingOrder?.Items?.Sum(i => i.CostPrice * i.Quantity) ?? 0m;
                        decimal netProfit = netAmount - totalCost;

                        var filter = Builders<Order>.Filter.Eq(o => o.Id, request.OrderId);
                        var update = Builders<Order>.Update
                            .Set(o => o.ExternalPaymentId, payment.Id.ToString())
                            .Set(o => o.PaymentStatus, status)
                            .Set(o => o.PaymentMethod, "CreditCard")
                            .Set(o => o.CardBrand, brand.ToLower())
                            .Set(o => o.Installments, request.Installments <= 0 ? 1 : request.Installments)
                            .Set(o => o.GatewayFee, totalFee)
                            .Set(o => o.NetReceivedAmount, netAmount)
                            .Set(o => o.TotalCostPrice, totalCost)
                            .Set(o => o.NetProfit, netProfit)
                            .Set(o => o.PaidAt, payment.Status == "approved" ? DateTime.UtcNow : null)
                            .Set(o => o.UpdatedAt, DateTime.UtcNow);

                        await _context.Orders.UpdateOneAsync(filter, update);

                        // Dispara o pedido no parceiro de dropshipping
                        if (status == "Paid" && _dropshippingService != null)
                        {
                            _ = Task.Run(async () =>
                            {
                                var paidOrder = await _context.Orders.Find(o => o.Id == request.OrderId).FirstOrDefaultAsync();
                                if (paidOrder != null)
                                {
                                    await _dropshippingService.PlaceSupplierOrderAsync(paidOrder);
                                }
                            });
                        }
                    }
                }
                catch (Exception dbEx)
                {
                    Console.WriteLine($"[MongoDB Warning]: {dbEx.Message}");
                }

                return Ok(new
                {
                    paymentId = payment.Id.ToString(),
                    status = payment.Status,
                    statusDetail = payment.StatusDetail
                });
            }
            catch (MercadoPago.Error.MercadoPagoApiException mpEx)
            {
                string errorDetail = mpEx.ApiResponse?.Content ?? mpEx.Message;
                Console.WriteLine($"[MercadoPago Card Error]: {errorDetail}");
                return StatusCode(500, new { message = "Erro ao processar cartão no Mercado Pago.", detail = errorDetail });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro interno no servidor.", detail = ex.Message });
            }
        }

        // Webhook para reconciliação de status
        [HttpGet("webhook")]
        [HttpPost("webhook")]
        public async Task<IActionResult> MercadoPagoWebhook([FromQuery] string? type, [FromQuery(Name = "data.id")] string dataId)
        {
            if (string.IsNullOrEmpty(dataId)) return BadRequest(new { message = "ID de pagamento ausente." });

            try
            {
                var filter = Builders<Order>.Filter.Eq(o => o.ExternalPaymentId, dataId);
                var update = Builders<Order>.Update
                    .Set(o => o.PaymentStatus, "Paid")
                    .Set(o => o.PaidAt, DateTime.UtcNow)
                    .Set(o => o.UpdatedAt, DateTime.UtcNow);

                var result = await _context.Orders.UpdateOneAsync(filter, update);

                Console.WriteLine($"[Webhook Success]: Pedidos atualizados = {result.ModifiedCount}");

                // Se o pedido foi aprovado via webhook (ex: PIX), despacha no fornecedor
                if (result.ModifiedCount > 0 && _dropshippingService != null)
                {
                    _ = Task.Run(async () =>
                    {
                        var paidOrder = await _context.Orders.Find(o => o.ExternalPaymentId == dataId).FirstOrDefaultAsync();
                        if (paidOrder != null)
                        {
                            await _dropshippingService.PlaceSupplierOrderAsync(paidOrder);
                        }
                    });
                }

                return Ok(new
                {
                    message = "Status atualizado com sucesso no banco de dados!",
                    modifiedCount = result.ModifiedCount,
                    paymentId = dataId
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Webhook Error]: {ex.Message}");
                return StatusCode(500, new { message = "Erro ao processar webhook.", detail = ex.Message });
            }
        }
    }
}