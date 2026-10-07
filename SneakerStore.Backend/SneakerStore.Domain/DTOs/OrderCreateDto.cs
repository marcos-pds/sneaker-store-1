using SneakerStore.Domain.Entities;

namespace SneakerStore.Domain.DTOs
{
    public class OrderCreateDto
    {
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerEmail { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;
        public string CustomerCpf { get; set; } = string.Empty;
        public Address ShippingAddress { get; set; } = new();
        public List<OrderItem> Items { get; set; } = new();
        public decimal TotalAmount { get; set; }
    }
}