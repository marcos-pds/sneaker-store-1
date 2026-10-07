namespace SneakerStore.Domain.DTOs
{
    public class CardPaymentRequestDto
    {
        public string OrderId { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string CardNumber { get; set; } = string.Empty;
        public string CardholderName { get; set; } = string.Empty;
        public string ExpirationMonth { get; set; } = string.Empty;
        public string ExpirationYear { get; set; } = string.Empty;
        public string SecurityCode { get; set; } = string.Empty;
        public string PaymentMethodId { get; set; } = string.Empty;
        public int Installments { get; set; } = 1;
        public string CustomerEmail { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerCpf { get; set; } = string.Empty;
    }
}