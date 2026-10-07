namespace SneakerStore.Domain.DTOs
{
    public class AliExpressOrderDto
    {
        public string StoreOrderId { get; set; } = string.Empty;
        public ShippingAddressDto ShippingAddress { get; set; } = new();
        public List<ProductItemDto> Products { get; set; } = new();
    }

    public class ShippingAddressDto
    {
        public string ContactName { get; set; } = string.Empty;
        public string AddressLine { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public string ZipCode { get; set; } = string.Empty;
        public string Country { get; set; } = "BR";
        public string Phone { get; set; } = string.Empty;
    }

    public class ProductItemDto
    {
        public string AliExpressProductId { get; set; } = string.Empty; // SKU do produto no AliExpress
        public string SkuCode { get; set; } = string.Empty; // Código da variante/tamanho
        public int Quantity { get; set; } = 1;
    }
}