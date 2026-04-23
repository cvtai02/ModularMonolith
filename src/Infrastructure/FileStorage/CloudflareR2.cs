using Amazon.Runtime;
using Amazon.S3;
using Amazon.S3.Model;
using SharedKernel.Abstractions.Services;
using SharedKernel.Extensions;

namespace Infrastructure.FileStorage;

public class CloudflareR2 : IFileManager
{
    private readonly ObjectStorageSettings _settings;
    private readonly ITenant _tenant;
    private readonly AmazonS3Client _client;

    public CloudflareR2(ObjectStorageSettings s, ITenant tenant)
    {
        _settings = s;
        _tenant = tenant;
        _client = CreateClient();
    }

    public string BuildPublicUrl(string key)
    {
        var normalizedKey = key;
        var cdnBaseUrl = _tenant.CdnBaseUrl.TrimEnd('/');
        return  $"{cdnBaseUrl}/{normalizedKey}";
    }

    public async Task DeleteBulkAsync(IEnumerable<string> keys, CancellationToken cancellationToken = default)
    {
        foreach (var key in keys)        {
            await _client.DeleteObjectAsync(new DeleteObjectRequest
            {
                BucketName = GetBucketName(),
                Key = key
            }, cancellationToken);
        }
    }

    public async Task<List<string>> GetPresignedUploadBulkUrlAsync(IEnumerable<PresignedUploadParameters> parameters, TimeSpan expiresIn, CancellationToken cancellationToken = default)
    {
        var urls = new List<string>(parameters.Count());
        foreach (var parameter in parameters)
        {
            var key = parameter.Key ?? GenerateKey(parameter.Category, parameter.Ext);
            var request = new GetPreSignedUrlRequest
            {
                BucketName = GetBucketName(),
                Key = key,
                Verb = HttpVerb.PUT,
                Expires = DateTime.Now.Add(expiresIn), // Cloudflare R2 does not support custom expiration time, it will default to 7 days, so we just set it to 2 days to be safe, and ignore the expiresIn parameter
                ContentType = parameter.ContentType,
            };
            urls.Add(await _client.GetPreSignedURLAsync(request));
        }

        return urls;
    }

    public async Task<string> UploadAsync(IEnumerable<UploadFileDto> dto, CancellationToken cancellationToken = default)
    {
        var keys = new List<string>();
        foreach (var item in dto)
        {
            var key = item.Key ?? GenerateKey(item.Category, item.Ext);
            var request = new PutObjectRequest
            {
                BucketName = GetBucketName(),
                Key = key,
                InputStream = item.File,
                ContentType = item.ContentType,
            };

            await _client.PutObjectAsync(request, cancellationToken);
            keys.Add(key);
        }

        return string.Join(",", keys);
    }

    private AmazonS3Client CreateClient()
    {
        var config = new AmazonS3Config
        {
            ServiceURL = _settings.ApiUrl,
            ForcePathStyle = true,
            AuthenticationRegion = "auto",
        };

        AWSCredentials credentials = new BasicAWSCredentials(_settings.AccessKeyId, _settings.SecretAccessKey);

        return new AmazonS3Client(credentials, config);
    }

    private string GetBucketName()
    {
        return _tenant.Signature;
    }

    public static string GenerateKey(string category, string ext)
    {
        var now = DateTime.UtcNow;
        var ulid = UlidGenerator.NewUlid(now).ToLower();

        return $"{category}/{ulid}{ext}";
    }

}
