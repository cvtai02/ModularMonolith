using System.Diagnostics.Contracts;

namespace SharedKernel.DTOs;

// this pattern can be used to avoid exceptions for performance
public readonly struct Result<T>
{
    private enum ResultState
    {
        Null,
        Failure,
        Success
    }

    private readonly ResultState _state;

    public T Value { get; }
    public Exception Exception { get; }
    public Dictionary<string, string[]> Errors { get; } = [];

    public bool IsSuccess => _state == ResultState.Success;
    public bool IsFailure => _state == ResultState.Failure;
    public bool IsNull => _state == ResultState.Null;

    public Result(T value)
    {
        Value = value;
        Exception = null!;
        _state = ResultState.Success;
    }

    public Result(Exception exception)
    {
        Value = default!;
        Exception = exception;
        _state = ResultState.Failure;
    }

    public Result()
    {
        Value = default!;
        Exception = null!;
        _state = ResultState.Null;
    }

    public Result(Dictionary<string, string[]> failures)
    {
        Value = default!;
        Exception = null!;
        Errors = failures;
        _state = ResultState.Failure;
    }
    
    [Pure]
    public TR Match<TR>(Func<T, TR> onSuccess, Func<Exception, TR> onFailure, Func<TR>? onNull = null) =>
        IsSuccess ? onSuccess(Value) :
        IsFailure ? onFailure(Exception) :
        onNull is not null
            ? onNull()
            : throw new InvalidOperationException("Result is null, but no onNull function was provided.");

    public static implicit operator Result<T>(T? value) => value is not null ? new Result<T>(value) : new Result<T>();
    public static implicit operator Result<T>(Exception exception) => new(exception);
}
