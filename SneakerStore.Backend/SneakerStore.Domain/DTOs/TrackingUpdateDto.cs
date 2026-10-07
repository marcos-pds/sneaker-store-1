namespace SneakerStore.Domain.DTOs
{
    public class TrackingUpdateDto
    {
        public string ExternalSupplierOrderId { get; set; } = string.Empty;
        public string TrackingCode { get; set; } = string.Empty;
        public string? Carrier { get; set; } = "Correios";
    }
}