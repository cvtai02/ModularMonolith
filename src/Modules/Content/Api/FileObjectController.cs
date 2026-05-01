using Content.DTOs.FileObjects;
using Content.Core.Usecases.FileObjects;
using Microsoft.AspNetCore.Mvc;
using SharedKernel.DTOs;

namespace Content.Api;

[ApiController]
[Route($"api/{ModuleConstants.Key}/file-objects")]
public class FileObjectController(
    ListMediaFiles listMediaFiles,
    GetPresignedUpload getPresignedUpload,
    ConfirmUpload confirmUpload,
    DeleteMediaFiles deleteMediaFiles) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PaginatedList<MediaFileResponse>>> GetAll(
        [FromQuery] ListMediaFilesRequest request, CancellationToken cancellationToken)
        => Ok(await listMediaFiles.ExecuteAsync(request, cancellationToken));

    [HttpPost("presigned-upload")]
    public async Task<ActionResult<PresignedUploadBulkUrlResponse>> GetPresignedUploadBulkUrl(
        [FromBody] GetPresignedUploadBulkUrlRequest request, CancellationToken cancellationToken)
        => Ok(await getPresignedUpload.ExecuteAsync(request, cancellationToken));

    [HttpPost("confirm-upload")]
    public async Task<ActionResult<ConfirmUploadResponse>> ConfirmUpload(
        [FromBody] ConfirmUploadRequest request, CancellationToken cancellationToken)
        => Ok(await confirmUpload.ExecuteAsync(request, cancellationToken));

    [HttpDelete]
    public async Task<IActionResult> Delete(
        [FromBody] DeleteMediaFilesRequest request, CancellationToken cancellationToken)
    {
        await deleteMediaFiles.ExecuteAsync(request, cancellationToken);
        return NoContent();
    }
}
