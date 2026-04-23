using Content.Core.DTOs.FileObjects;
using Content.Core.Usecases.FileObjects;
using Microsoft.AspNetCore.Mvc;

namespace Content.Api;

[ApiController]
[Route($"api/{ModuleConstants.Key}/file-objects")]
public class FileObjectController(GetPresignedUpload getPresignedUpload, ConfirmUpload confirmUpload) : ControllerBase
{
    [HttpPost("presigned-upload")]
    public async Task<ActionResult<List<PresignedUploadUrlResponse>>> GetPresignedUploadBulkUrl(
        [FromBody] GetPresignedUploadBulkUrlRequest request, CancellationToken cancellationToken)
        => Ok(await getPresignedUpload.ExecuteAsync(request, cancellationToken));

    [HttpPost]
    public async Task<ActionResult<List<UploadResponse>>> ConfirmUpload(
        [FromBody] ConfirmUploadRequest request, CancellationToken cancellationToken)
        => Ok(await confirmUpload.ExecuteAsync(request, cancellationToken));
}
