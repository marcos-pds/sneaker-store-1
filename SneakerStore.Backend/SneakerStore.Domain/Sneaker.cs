using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace SneakerStore.Domain.Entities
{
    [BsonIgnoreExtraElements]
    public class Sneaker
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = string.Empty;

        [BsonElement("title")]
        public string Title { get; set; } = string.Empty;

        [BsonElement("brand")]
        public string Brand { get; set; } = string.Empty;

        [BsonElement("price")]
        public decimal Price { get; set; }

        [BsonElement("originalPrice")]
        public decimal? OriginalPrice { get; set; }

        [BsonElement("imageUrl")]
        public string ImageUrl { get; set; } = string.Empty;
        public List<string> ImageUrls { get; set; } = new();

        [BsonElement("sizes")]
        public List<int> Sizes { get; set; } = new List<int>();

        [BsonElement("isNew")]
        public bool IsNew { get; set; }

        [BsonElement("isBestseller")]
        public bool IsBestseller { get; set; }
        public bool IsPublished { get; set; } = true;

        [BsonElement("rating")]
        public double Rating { get; set; } = 5.0; // Propriedade adicionada

        [BsonElement("description")]
        public string? Description { get; set; } // Propriedade adicionada

        [BsonElement("stockQuantity")]
        public int StockQuantity { get; set; } = 10;
    }
}