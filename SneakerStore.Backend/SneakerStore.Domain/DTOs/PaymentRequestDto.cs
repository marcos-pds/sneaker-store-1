namespace SneakerStore.Domain.DTOs
{
    public class PaymentRequestDto
    {
        public string OrderId { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string CustomerEmail { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerCpf { get; set; } = string.Empty;
    }
}