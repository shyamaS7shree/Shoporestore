using Microsoft.EntityFrameworkCore;
using Shoporestore.Api.Data;

namespace Shoporestore.Api.Services;

public static class DatabaseSchemaService
{
    public static async Task EnsureCompatibleAsync(ShoporeDbContext db)
    {
        await db.Database.ExecuteSqlRawAsync(@"
IF OBJECT_ID(N'[Users]', N'U') IS NOT NULL AND COL_LENGTH(N'[Users]', N'DateOfBirth') IS NULL
BEGIN
    ALTER TABLE [Users] ADD [DateOfBirth] date NULL;
END

IF OBJECT_ID(N'[Users]', N'U') IS NOT NULL AND COL_LENGTH(N'[Users]', N'Gender') IS NULL
BEGIN
    ALTER TABLE [Users] ADD [Gender] nvarchar(20) NULL;
END

IF OBJECT_ID(N'[Reviews]', N'U') IS NOT NULL AND COL_LENGTH(N'[Reviews]', N'ImageDataUrl') IS NULL
BEGIN
    ALTER TABLE [Reviews] ADD [ImageDataUrl] nvarchar(max) NULL;
END

IF OBJECT_ID(N'[Reviews]', N'U') IS NOT NULL AND COL_LENGTH(N'[Reviews]', N'IsDemo') IS NULL
BEGIN
    ALTER TABLE [Reviews] ADD [IsDemo] bit NOT NULL CONSTRAINT [DF_Reviews_IsDemo] DEFAULT 0;
END

IF OBJECT_ID(N'[Reviews]', N'U') IS NOT NULL
BEGIN
    IF EXISTS (SELECT 1 FROM sys.key_constraints WHERE parent_object_id = OBJECT_ID(N'[Reviews]') AND name = N'UQ_Review_User_OrderItem')
        ALTER TABLE [Reviews] DROP CONSTRAINT [UQ_Review_User_OrderItem];
    IF EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'[Reviews]') AND name = N'IX_Reviews_UserId_OrderItemId')
        DROP INDEX [IX_Reviews_UserId_OrderItemId] ON [Reviews];
    IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[Reviews]') AND name = N'OrderItemId' AND is_nullable = 0)
        ALTER TABLE [Reviews] ALTER COLUMN [OrderItemId] int NULL;
    CREATE UNIQUE INDEX [IX_Reviews_UserId_OrderItemId] ON [Reviews] ([UserId], [OrderItemId]) WHERE [OrderItemId] IS NOT NULL;
END

IF OBJECT_ID(N'[Addresses]', N'U') IS NOT NULL AND COL_LENGTH(N'[Addresses]', N'AddressLine') IS NULL
BEGIN
    ALTER TABLE [Addresses] ADD [AddressLine] nvarchar(400) NOT NULL CONSTRAINT [DF_Addresses_AddressLine] DEFAULT N'';
END

IF OBJECT_ID(N'[Addresses]', N'U') IS NOT NULL AND COL_LENGTH(N'[Addresses]', N'PinCode') IS NULL
BEGIN
    ALTER TABLE [Addresses] ADD [PinCode] nvarchar(20) NOT NULL CONSTRAINT [DF_Addresses_PinCode] DEFAULT N'';
END

IF OBJECT_ID(N'[Addresses]', N'U') IS NOT NULL AND COL_LENGTH(N'[Addresses]', N'IsDeleted') IS NULL
BEGIN
    ALTER TABLE [Addresses] ADD [IsDeleted] bit NOT NULL CONSTRAINT [DF_Addresses_IsDeleted] DEFAULT 0;
END

IF OBJECT_ID(N'[Addresses]', N'U') IS NOT NULL AND COL_LENGTH(N'[Addresses]', N'CreatedAt') IS NULL
BEGIN
    ALTER TABLE [Addresses] ADD [CreatedAt] datetime2 NOT NULL CONSTRAINT [DF_Addresses_CreatedAt] DEFAULT SYSUTCDATETIME();
END

IF OBJECT_ID(N'[Orders]', N'U') IS NOT NULL AND COL_LENGTH(N'[Orders]', N'Total') IS NULL
BEGIN
    ALTER TABLE [Orders] ADD [Total] decimal(18,2) NOT NULL CONSTRAINT [DF_Orders_Total] DEFAULT 0;
END

IF OBJECT_ID(N'[Orders]', N'U') IS NOT NULL AND COL_LENGTH(N'[Orders]', N'PaymentId') IS NULL
BEGIN
    ALTER TABLE [Orders] ADD [PaymentId] nvarchar(150) NULL;
END

IF OBJECT_ID(N'[Orders]', N'U') IS NOT NULL AND COL_LENGTH(N'[Orders]', N'PaymentMethod') IS NULL
BEGIN
    ALTER TABLE [Orders] ADD [PaymentMethod] nvarchar(50) NULL;
END

IF OBJECT_ID(N'[Orders]', N'U') IS NOT NULL AND COL_LENGTH(N'[Orders]', N'CancellationReason') IS NULL
BEGIN
    ALTER TABLE [Orders] ADD [CancellationReason] nvarchar(500) NULL;
END

IF OBJECT_ID(N'[OrderItems]', N'U') IS NOT NULL AND COL_LENGTH(N'[OrderItems]', N'Price') IS NULL
BEGIN
    ALTER TABLE [OrderItems] ADD [Price] decimal(18,2) NOT NULL CONSTRAINT [DF_OrderItems_Price] DEFAULT 0;
END

IF OBJECT_ID(N'[OrderItems]', N'U') IS NOT NULL AND COL_LENGTH(N'[OrderItems]', N'ProductBrand') IS NULL
BEGIN
    ALTER TABLE [OrderItems] ADD [ProductBrand] nvarchar(120) NULL;
END

IF OBJECT_ID(N'[OrderItems]', N'U') IS NOT NULL AND COL_LENGTH(N'[OrderItems]', N'ProductImage') IS NULL
BEGIN
    ALTER TABLE [OrderItems] ADD [ProductImage] nvarchar(1000) NULL;
END

IF OBJECT_ID(N'[OrderItems]', N'U') IS NOT NULL AND COL_LENGTH(N'[OrderItems]', N'ProductSize') IS NULL
BEGIN
    ALTER TABLE [OrderItems] ADD [ProductSize] nvarchar(50) NULL;
END

IF OBJECT_ID(N'[OrderItems]', N'U') IS NOT NULL AND COL_LENGTH(N'[OrderItems]', N'ProductColor') IS NULL
BEGIN
    ALTER TABLE [OrderItems] ADD [ProductColor] nvarchar(80) NULL;
END


IF OBJECT_ID(N'[Addresses]', N'U') IS NOT NULL AND COL_LENGTH(N'[Addresses]', N'AddressLine1') IS NOT NULL
BEGIN
    UPDATE [Addresses] SET [AddressLine1] = ISNULL(NULLIF([AddressLine1], N''), ISNULL([AddressLine], N''));
END

IF OBJECT_ID(N'[Addresses]', N'U') IS NOT NULL AND COL_LENGTH(N'[Addresses]', N'PostalCode') IS NOT NULL
BEGIN
    UPDATE [Addresses] SET [PostalCode] = ISNULL(NULLIF([PostalCode], N''), ISNULL([PinCode], N''));
END

IF OBJECT_ID(N'[Orders]', N'U') IS NOT NULL AND COL_LENGTH(N'[Orders]', N'TotalAmount') IS NOT NULL
BEGIN
    UPDATE [Orders] SET [TotalAmount] = CASE WHEN [TotalAmount] = 0 THEN ISNULL([Total], 0) ELSE [TotalAmount] END;
END

IF OBJECT_ID(N'[OrderItems]', N'U') IS NOT NULL AND COL_LENGTH(N'[OrderItems]', N'ProductId') IS NOT NULL
BEGIN
    DECLARE @dropOrderItemProductFk nvarchar(max) = N'';
    SELECT @dropOrderItemProductFk = @dropOrderItemProductFk + N'ALTER TABLE [OrderItems] DROP CONSTRAINT [' + fk.name + N'];'
    FROM sys.foreign_keys fk
    WHERE fk.parent_object_id = OBJECT_ID(N'[OrderItems]')
      AND fk.referenced_object_id = OBJECT_ID(N'[Products]');
    IF LEN(@dropOrderItemProductFk) > 0 EXEC sp_executesql @dropOrderItemProductFk;
    IF EXISTS (
        SELECT 1 FROM sys.columns
        WHERE object_id = OBJECT_ID(N'[OrderItems]') AND name = N'ProductId' AND is_nullable = 0
    )
    BEGIN
        ALTER TABLE [OrderItems] ALTER COLUMN [ProductId] int NULL;
    END
END

IF OBJECT_ID(N'[OrderItems]', N'U') IS NOT NULL AND COL_LENGTH(N'[OrderItems]', N'ProductVariantId') IS NOT NULL
BEGIN
    IF EXISTS (
        SELECT 1 FROM sys.columns
        WHERE object_id = OBJECT_ID(N'[OrderItems]') AND name = N'ProductVariantId' AND is_nullable = 0
    )
    BEGIN
        ALTER TABLE [OrderItems] ALTER COLUMN [ProductVariantId] int NULL;
    END
END
IF OBJECT_ID(N'[Products]', N'U') IS NOT NULL AND COL_LENGTH(N'[Products]', N'Brand') IS NULL
BEGIN
    ALTER TABLE [Products] ADD [Brand] nvarchar(120) NOT NULL CONSTRAINT [DF_Products_Brand] DEFAULT N'Shopore';
END

IF OBJECT_ID(N'[Products]', N'U') IS NOT NULL AND COL_LENGTH(N'[Products]', N'Category') IS NULL
BEGIN
    ALTER TABLE [Products] ADD [Category] nvarchar(120) NOT NULL CONSTRAINT [DF_Products_Category] DEFAULT N'General';
END

IF OBJECT_ID(N'[Products]', N'U') IS NOT NULL AND COL_LENGTH(N'[Products]', N'SubCategory') IS NULL
BEGIN
    ALTER TABLE [Products] ADD [SubCategory] nvarchar(120) NULL;
END

IF OBJECT_ID(N'[Products]', N'U') IS NOT NULL AND COL_LENGTH(N'[Products]', N'Image') IS NULL
BEGIN
    ALTER TABLE [Products] ADD [Image] nvarchar(1000) NULL;
END

IF OBJECT_ID(N'[Products]', N'U') IS NOT NULL AND COL_LENGTH(N'[Products]', N'SizeOptions') IS NULL
BEGIN
    ALTER TABLE [Products] ADD [SizeOptions] nvarchar(250) NULL;
END

IF OBJECT_ID(N'[Products]', N'U') IS NOT NULL AND COL_LENGTH(N'[Products]', N'Price') IS NULL
BEGIN
    ALTER TABLE [Products] ADD [Price] decimal(18,2) NOT NULL CONSTRAINT [DF_Products_Price] DEFAULT 0;
END

IF OBJECT_ID(N'[Products]', N'U') IS NOT NULL AND COL_LENGTH(N'[Products]', N'OriginalPrice') IS NULL
BEGIN
    ALTER TABLE [Products] ADD [OriginalPrice] decimal(18,2) NULL;
END

IF OBJECT_ID(N'[Products]', N'U') IS NOT NULL AND COL_LENGTH(N'[Products]', N'Rating') IS NULL
BEGIN
    ALTER TABLE [Products] ADD [Rating] decimal(3,2) NOT NULL CONSTRAINT [DF_Products_Rating] DEFAULT 0;
END

IF OBJECT_ID(N'[Products]', N'U') IS NOT NULL AND COL_LENGTH(N'[Products]', N'ReviewsCount') IS NULL
BEGIN
    ALTER TABLE [Products] ADD [ReviewsCount] int NOT NULL CONSTRAINT [DF_Products_ReviewsCount] DEFAULT 0;
END

IF OBJECT_ID(N'[Products]', N'U') IS NOT NULL
BEGIN
    IF COL_LENGTH(N'[Products]', N'CategoryId') IS NOT NULL
    BEGIN
        DECLARE @dropProductCategoryFk nvarchar(max) = N'';
        SELECT @dropProductCategoryFk = @dropProductCategoryFk + N'ALTER TABLE [Products] DROP CONSTRAINT [' + fk.name + N'];'
        FROM sys.foreign_keys fk
        WHERE fk.parent_object_id = OBJECT_ID(N'[Products]')
          AND fk.referenced_object_id = OBJECT_ID(N'[Categories]');
        IF LEN(@dropProductCategoryFk) > 0 EXEC sp_executesql @dropProductCategoryFk;
        IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[Products]') AND name = N'CategoryId' AND is_nullable = 0)
        BEGIN
            ALTER TABLE [Products] ALTER COLUMN [CategoryId] int NULL;
        END
    END

    IF COL_LENGTH(N'[Products]', N'BrandId') IS NOT NULL
    BEGIN
        DECLARE @dropProductBrandFk nvarchar(max) = N'';
        SELECT @dropProductBrandFk = @dropProductBrandFk + N'ALTER TABLE [Products] DROP CONSTRAINT [' + fk.name + N'];'
        FROM sys.foreign_keys fk
        WHERE fk.parent_object_id = OBJECT_ID(N'[Products]')
          AND fk.referenced_object_id = OBJECT_ID(N'[Brands]');
        IF LEN(@dropProductBrandFk) > 0 EXEC sp_executesql @dropProductBrandFk;
    END

    IF COL_LENGTH(N'[Products]', N'Category') IS NOT NULL AND COL_LENGTH(N'[Products]', N'CategoryId') IS NOT NULL AND OBJECT_ID(N'[Categories]', N'U') IS NOT NULL
    BEGIN
        EXEC sp_executesql N'
            UPDATE p
            SET [Category] = COALESCE(NULLIF(p.[Category], N''''), c.[Name], N''General'')
            FROM [Products] p
            LEFT JOIN [Categories] c ON c.[Id] = p.[CategoryId];';
    END

    IF COL_LENGTH(N'[Products]', N'Brand') IS NOT NULL AND COL_LENGTH(N'[Products]', N'BrandId') IS NOT NULL AND OBJECT_ID(N'[Brands]', N'U') IS NOT NULL
    BEGIN
        EXEC sp_executesql N'
            UPDATE p
            SET [Brand] = COALESCE(NULLIF(p.[Brand], N''''), b.[Name], N''Shopore'')
            FROM [Products] p
            LEFT JOIN [Brands] b ON b.[Id] = p.[BrandId];';
    END
END
IF OBJECT_ID(N'[LoginOtps]', N'U') IS NULL
BEGIN
    CREATE TABLE [LoginOtps]
    (
        [Id] int IDENTITY(1,1) NOT NULL CONSTRAINT [PK_LoginOtps] PRIMARY KEY,
        [Phone] nvarchar(20) NOT NULL,
        [Otp] nvarchar(20) NOT NULL,
        [ExpiresAt] datetime2 NOT NULL,
        [Used] bit NOT NULL CONSTRAINT [DF_LoginOtps_Used] DEFAULT 0,
        [CreatedAt] datetime2 NOT NULL CONSTRAINT [DF_LoginOtps_CreatedAt] DEFAULT SYSUTCDATETIME()
    );

    CREATE INDEX [IX_LoginOtps_Phone_Otp_Used_ExpiresAt]
        ON [LoginOtps] ([Phone], [Otp], [Used], [ExpiresAt]);
END

IF OBJECT_ID(N'[WishlistItems]', N'U') IS NULL
BEGIN
    CREATE TABLE [WishlistItems]
    (
        [Id] int IDENTITY(1,1) NOT NULL CONSTRAINT [PK_WishlistItems] PRIMARY KEY,
        [UserId] int NOT NULL,
        [ProductId] int NOT NULL,
        [CreatedAt] datetime2 NOT NULL CONSTRAINT [DF_WishlistItems_CreatedAt] DEFAULT SYSUTCDATETIME()
    );
END

IF OBJECT_ID(N'[WishlistItems]', N'U') IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_WishlistItems_UserId_ProductId' AND object_id = OBJECT_ID(N'[WishlistItems]'))
BEGIN
    CREATE UNIQUE INDEX [IX_WishlistItems_UserId_ProductId] ON [WishlistItems] ([UserId], [ProductId]);
END
");
    }
}



