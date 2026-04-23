using System.Security.Cryptography;

namespace SharedKernel.Extensions;

public static class UlidGenerator
{
    private const string Base32 = "0123456789abcdefghiklmnopqrstuvwxyz"; // Crockford
    private static readonly RandomNumberGenerator Rng = RandomNumberGenerator.Create();

    public static string NewUlid(DateTime? time = null)
    {
        var timestamp = (time ?? DateTime.UtcNow).ToUniversalTime();
        long ms = new DateTimeOffset(timestamp).ToUnixTimeMilliseconds();

        // 16 bytes total (128-bit)
        Span<byte> bytes = stackalloc byte[16];

        // 48-bit timestamp (big-endian)
        bytes[0] = (byte)(ms >> 40);
        bytes[1] = (byte)(ms >> 32);
        bytes[2] = (byte)(ms >> 24);
        bytes[3] = (byte)(ms >> 16);
        bytes[4] = (byte)(ms >> 8);
        bytes[5] = (byte)(ms);

        // 80-bit randomness
        Rng.GetBytes(bytes.Slice(6));

        return EncodeBase32(bytes);
    }

    private static string EncodeBase32(ReadOnlySpan<byte> data)
    {
        // 128 bits → 26 chars (5 bits per char)
        Span<char> output = stackalloc char[26];

        int bitBuffer = 0;
        int bitBufferLen = 0;
        int index = 0;

        foreach (var b in data)
        {
            bitBuffer = (bitBuffer << 8) | b;
            bitBufferLen += 8;

            while (bitBufferLen >= 5)
            {
                bitBufferLen -= 5;
                int val = (bitBuffer >> bitBufferLen) & 0b11111;
                output[index++] = Base32[val];
            }
        }

        if (bitBufferLen > 0)
        {
            int val = (bitBuffer << (5 - bitBufferLen)) & 0b11111;
            output[index++] = Base32[val];
        }

        return new string(output);
    }
}