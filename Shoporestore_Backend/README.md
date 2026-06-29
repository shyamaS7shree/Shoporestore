# Shoporestore Backend

ASP.NET Core Web API backend for the Shoporestore frontend.

## Run locally

```powershell
dotnet run --project .\Shoporestore.Api\Shoporestore.Api.csproj --urls http://localhost:5285
```

Swagger UI:

```text
http://localhost:5285/swagger
```

Frontend `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5285
```

## Local SQL Server secret

The SQL Server connection string is stored with .NET user-secrets, not in Git.

```powershell
dotnet user-secrets set "ConnectionStrings:ShoporeDb" "Server=192.168.1.14;Database=Shopore_DB;User Id=sa;Password=YOUR_PASSWORD;TrustServerCertificate=True;MultipleActiveResultSets=True" --project .\Shoporestore.Api\Shoporestore.Api.csproj
```
