using System.Text.Json;
using System.Text.RegularExpressions;
using SneakerStore.Domain.Entities;

namespace SneakerStore.Infrastructure.Services
{
    public class AliExpressImporterService
    {
        private readonly HttpClient _httpClient;

        public AliExpressImporterService(HttpClient httpClient)
        {
            _httpClient = httpClient;
            _httpClient.DefaultRequestHeaders.Clear();
            _httpClient.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36");
            _httpClient.DefaultRequestHeaders.Add("Accept-Language", "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7");
        }

        public async Task<Sneaker?> ImportFromAliExpressAsync(string aliexpressUrl, decimal profitMarginPercentage = 50)
        {
            try
            {
                var productId = ExtractProductId(aliexpressUrl);
                if (string.IsNullOrEmpty(productId)) return null;

                var cleanUrl = $"https://pt.aliexpress.com/item/{productId}.html";
                var htmlContent = await _httpClient.GetStringAsync(cleanUrl);

                // 1. Extração do Título Real
                string title = "Sneaker Importado Premium";
                var titleMatch = Regex.Match(htmlContent, @"<meta\s+property=""og:title""\s+content=""([^""]+)""");
                if (titleMatch.Success)
                {
                    title = titleMatch.Groups[1].Value
                        .Replace(" - AliExpress", "")
                        .Replace(" | AliExpress", "")
                        .Trim();
                }

                // 2. Extração de TODAS as Imagens Reais
                List<string> imageUrls = new();

                // Busca o array imagePathList no script
                var imagesMatch = Regex.Match(htmlContent, @"""imagePathList""\s*:\s*(\[[^\]]+\])");
                if (imagesMatch.Success)
                {
                    try
                    {
                        var parsedImages = JsonSerializer.Deserialize<List<string>>(imagesMatch.Groups[1].Value);
                        if (parsedImages != null && parsedImages.Count > 0)
                        {
                            imageUrls = parsedImages
                                .Select(img => img.StartsWith("//") ? $"https:{img}" : img)
                                .Select(img => Regex.Replace(img, @"_\d+x\d+\.(jpg|jpeg|png).*", ""))
                                .Distinct()
                                .Take(6)
                                .ToList();
                        }
                    }
                    catch { }
                }

                // Fallback para capturar imagens da CDN alicdn no HTML se o JSON falhar
                if (imageUrls.Count == 0)
                {
                    var cdnMatches = Regex.Matches(htmlContent, @"https?://ae01\.alicdn\.com/kf/[a-zA-Z0-9_\.-]+\.(jpg|jpeg|png)");
                    imageUrls = cdnMatches
                        .Select(m => m.Value)
                        .Select(img => Regex.Replace(img, @"_\d+x\d+\.(jpg|jpeg|png).*", ""))
                        .Distinct()
                        .Take(6)
                        .ToList();
                }

                // 3. Extração do Preço Real
                decimal costPrice = 180.00m;
                var priceMatch = Regex.Match(htmlContent, @"""formattedAmount"":""R\$?\s*([\d\.,]+)""|""actMinPrice"":""([\d\.,]+)""|""minAmount"":\{""value"":([\d\.]+)");
                if (priceMatch.Success)
                {
                    string rawPrice = priceMatch.Groups[1].Success ? priceMatch.Groups[1].Value :
                                     (priceMatch.Groups[2].Success ? priceMatch.Groups[2].Value : priceMatch.Groups[3].Value);

                    rawPrice = rawPrice.Replace(".", "").Replace(",", ".");
                    if (decimal.TryParse(rawPrice, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out decimal parsedPrice))
                    {
                        costPrice = parsedPrice;
                    }
                }

                decimal finalPrice = Math.Round(costPrice * (1 + (profitMarginPercentage / 100)), 2);
                string mainImage = imageUrls.FirstOrDefault() ?? "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800";

                return new Sneaker
                {
                    Title = title,
                    Brand = DetectBrand(title),
                    Price = finalPrice > 0 ? finalPrice : 270.00m,
                    OriginalPrice = Math.Round((finalPrice > 0 ? finalPrice : 270.00m) * 1.35m, 2),
                    ImageUrl = mainImage,
                    ImageUrls = imageUrls.Count > 0 ? imageUrls : new List<string> { mainImage },
                    Sizes = new List<int> { 38, 39, 40, 41, 42, 43 },
                    IsNew = true,
                    StockQuantity = 25,
                    Description = $"Edição importada oficial diretamente do fornecedor no AliExpress (ID: {productId}). Material de alta qualidade, acabamento reforçado e conforto anatômico.",
                    IsPublished = false
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[AliExpressScraper Error] {ex.Message}");
                var id = ExtractProductId(aliexpressUrl);
                string defaultImg = "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800";
                return new Sneaker
                {
                    Title = $"Sneaker Importado AliExpress #{id}",
                    Brand = "NIKE",
                    Price = 270.00m,
                    OriginalPrice = 364.50m,
                    ImageUrl = defaultImg,
                    ImageUrls = new List<string> { defaultImg },
                    Sizes = new List<int> { 38, 39, 40, 41, 42 },
                    IsNew = true,
                    StockQuantity = 10,
                    Description = "Produto importado com garantia de autenticidade."
                };
            }
        }

        private static string ExtractProductId(string url)
        {
            if (string.IsNullOrWhiteSpace(url)) return string.Empty;

            var match = Regex.Match(url, @"(?:item/|itemId=)(\d+)");
            if (match.Success) return match.Groups[1].Value;

            var numberMatch = Regex.Match(url, @"\d{10,}");
            if (numberMatch.Success) return numberMatch.Value;

            return string.Empty;
        }

        private static string DetectBrand(string title)
        {
            string t = title.ToUpper();
            if (t.Contains("JORDAN")) return "JORDAN";
            if (t.Contains("NIKE") || t.Contains("DUNK") || t.Contains("AIR FORCE")) return "NIKE";
            if (t.Contains("YEEZY") || t.Contains("ADIDAS") || t.Contains("FORUM")) return "ADIDAS";
            return "NIKE";
        }
    }
}