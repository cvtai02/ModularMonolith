using FluentValidation.Results;
using SharedKernel.Exceptions;

namespace SharedKernel.Extensions;

public static class ValidationExceptionExtension
{
    extension (ValidationException exception)
    {
        public static ValidationException FromFluentFailure(ValidationFailure failure)
        {
            var errors = new Dictionary<string, string[]>();
            if (failure != null)
            {
                errors.Add(failure.PropertyName, [failure.ErrorMessage]);
            }
            return new ValidationException("Validation failed", errors);
        }
    }
}