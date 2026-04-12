# Ed, Edd n Eddy Archive.org Upload for Nostalgia Nebula

## Overview
This script will bulk upload all Ed, Edd n Eddy episodes to Archive.org for the Nostalgia Nebula livestream. Each episode is properly formatted with metadata, descriptions, and organized for easy streaming integration.

## Features
- ✅ Automatic metadata generation for each episode
- ✅ Proper episode titles and descriptions
- ✅ Commercial break parts (P1, P2, P3) maintained
- ✅ Nostalgia Nebula branding and attribution
- ✅ Rate limiting to avoid Archive.org restrictions
- ✅ Error handling and retry capability
- ✅ Progress tracking and summary report

## Quick Setup

### 1. Install Dependencies
```bash
python setup_upload.py
```

This will:
- Install the `internetarchive` Python package
- Configure your Archive.org credentials
- Verify all Ed, Edd n Eddy files are found

### 2. Configure Archive.org Credentials
You'll need:
- Archive.org username
- Archive.org password
- (Optional) API keys for automated uploads

Create an account at: https://archive.org/account/signup

### 3. Run the Upload
```bash
python upload_ed_edd_eddy.py
```

## What Gets Uploaded

### Episode Structure
- **26 episodes** from Seasons 1-2 (52 total files with parts)
- **3 parts per episode** (for commercial breaks)
- **720p HMax Web-DL quality**
- **Properly tagged metadata**

### Metadata Included
- Episode title and description
- Original air dates
- Cartoon Network attribution
- Nostalgia Nebula branding
- Creative Commons licensing
- Searchable tags and subjects

### File Naming Convention
```
nostalgia-nebula-ed-edd-eddy-s01-e01-e02-part-1
nostalgia-nebula-ed-edd-eddy-s01-e01-e02-part-2
nostalgia-nebula-ed-edd-eddy-s01-e01-e02-part-3
```

## Upload Details

### Rate Limiting
- 3 second delay between uploads
- 30 second break every 10 uploads
- Prevents Archive.org rate limiting

### Error Handling
- Failed uploads saved to `failed_uploads.txt`
- Can retry failed files separately
- Detailed error logging

### Progress Tracking
```
[1/52] Processing: Ed, Edd n Eddy - S01 E01-E02 - The Ed-Touchables and Nagged to Ed (720p - HMax Web-DL) P1.mp4
Identifier: nostalgia-nebula-ed-edd-eddy-s01-e01-e02-part-1
Episode: S01 E01-E02 Part 1
✅ Successfully uploaded: ...
```

## Integration with Nostalgia Nebula

Once uploaded, these episodes will be:
1. **Available for streaming** in the TV schedule
2. **Searchable on Archive.org** with proper metadata
3. **Accessible via API** for the livestream system
4. **Preserved for posterity** with proper attribution

### Update schedule.json
After upload, you'll need to update your `schedule.json` with the Archive.org URLs:

```json
{
  "title": "Ed, Edd n Eddy - S01 E01-E02 - The Ed-Touchables and Nagged to Ed P1",
  "url": "https://archive.org/download/nostalgia-nebula-ed-edd-eddy-s01-e01-e02-part-1/Ed,%20Edd%20n%20Eddy%20-%20S01%20E01-E02%20-%20The%20Ed-Touchables%20and%20Nagged%20to%20Ed%20(720p%20-%20HMax%20Web-DL)%20P1.mp4"
}
```

## Troubleshooting

### Common Issues

**"internetarchive library not found"**
```bash
pip install internetarchive
```

**"Credentials not configured"**
```bash
python -c "import internetarchive as ia; ia.configure()"
```

**"Rate limited"**
- Wait longer between uploads
- Check failed_uploads.txt and retry later

**"File already exists"**
- Script will skip existing uploads
- Check Archive.org for the item

### Manual Retry
If some uploads fail, check `failed_uploads.txt` and run:
```bash
python upload_ed_edd_eddy.py --retry-failed
```

## Legal & Attribution

- **Content**: Copyright Cartoon Network
- **Uploader**: Nostalgia Nebula
- **License**: Creative Commons BY-NC-SA 4.0
- **Purpose**: Preservation and streaming
- **Attribution**: Full creator and network credit in metadata

## Support

For issues with:
- **Archive.org**: https://archive.org/about/contact.php
- **Python scripts**: Check error logs
- **Nostalgia Nebula**: GitHub issues

---

**Nostalgia Nebula** - Preserving Cartoon Network history, one episode at a time! 📺✨
