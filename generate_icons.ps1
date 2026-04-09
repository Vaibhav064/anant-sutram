# Generate Android icons from source logo
Add-Type -AssemblyName System.Drawing

$sourcePath = "C:\Users\bosev\.gemini\antigravity\brain\4581507c-c741-4187-a83c-a388a21ad55c\anant_sutram_logo_1775590271702.png"
$resDir = "C:\Users\bosev\Desktop\ANANT SUTRAM\android\app\src\main\res"

# Icon sizes for each density
$icons = @(
    @{ dir = "mipmap-mdpi";    size = 48  },
    @{ dir = "mipmap-hdpi";    size = 72  },
    @{ dir = "mipmap-xhdpi";   size = 96  },
    @{ dir = "mipmap-xxhdpi";  size = 144 },
    @{ dir = "mipmap-xxxhdpi"; size = 192 }
)

$src = [System.Drawing.Image]::FromFile($sourcePath)

foreach ($icon in $icons) {
    $size = $icon.size
    $dir = Join-Path $resDir $icon.dir
    
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.DrawImage($src, 0, 0, $size, $size)
    $g.Dispose()
    
    $outPath = Join-Path $dir "ic_launcher.png"
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $outPath2 = Join-Path $dir "ic_launcher_round.png"
    $bmp.Save($outPath2, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $outPath3 = Join-Path $dir "ic_launcher_foreground.png"
    $bmp.Save($outPath3, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $bmp.Dispose()
    Write-Host "Generated $($icon.dir) ($size x $size)"
}

$src.Dispose()
Write-Host "All icons generated successfully!"
