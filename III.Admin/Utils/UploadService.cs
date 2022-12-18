using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace ESEIM.Utils
{
    public interface IUploadService
    {
        JMessage UploadFile(IFormFile fileUpload, string pathUpload);
        JMessage UploadFileByBytes(byte[] bytes, string fileName, string root, string pathUpload);
        JMessage UploadImage(IFormFile fileUpload);
        JMessage UploadImage(IFormFile fileUpload, string pathUpload);
        JMessage UploadImage(Image fileUpload, string fileName);
        Image Base64ToImage(string base64String);
    }

    public class UploadService : IUploadService
    {
        private readonly IHostingEnvironment _hostingEnvironment;

        public UploadService(IHostingEnvironment hostingEnvironment)
        {
            _hostingEnvironment = hostingEnvironment;
        }
        public JMessage UploadFile(IFormFile fileUpload, string pathUpload)
        {
            var mess = new JMessage { Error = false, Title = "" };
            try
            {
                var filePath = Path.GetTempFileName();
                if (!Directory.Exists(pathUpload)) Directory.CreateDirectory(pathUpload);
                var fileName = FileExtensions.CleanFileName(Path.GetFileName(fileUpload.FileName));
                fileName = Path.GetFileNameWithoutExtension(fileName)
                          + "_"
                          + Guid.NewGuid().ToString().Substring(0, 8)
                          + Path.GetExtension(fileName);
                var fullPath = Path.Combine(pathUpload, fileName);
                using (var stream = new FileStream(fullPath, FileMode.Create))
                {
                    fileUpload.CopyTo(stream);
                }
                mess.Object = fileName;
                //fileUpload.CopyTo(new FileStream(fullPath, FileMode.Create));
            }
            catch (Exception ex)
            {
                mess.Error = true;
                mess.Title = ex.Message;
            }
            return mess;
        }
        public virtual JMessage UploadImage(IFormFile fileUpload)
        {
            var mess = new JMessage { Error = false, Title = "" };
            try
            {
                var filePath = Path.GetTempFileName();
                var pathUpload = Path.Combine(_hostingEnvironment.WebRootPath, "uploads\\images");
                if (!Directory.Exists(pathUpload)) Directory.CreateDirectory(pathUpload);
                var fileName = FileExtensions.CleanFileName(Path.GetFileName(fileUpload.FileName));
                fileName = Path.GetFileNameWithoutExtension(fileName)
                          + "_"
                          + Guid.NewGuid().ToString().Substring(0, 8)
                          + Path.GetExtension(fileName);
                var fullPath = Path.Combine(pathUpload, fileName);
                using (var stream = new FileStream(fullPath, FileMode.Create))
                {
                    fileUpload.CopyTo(stream);
                }
                mess.Object = fileName;
                //fileUpload.CopyTo(new FileStream(fullPath, FileMode.Create));
            }
            catch (Exception ex)
            {
                mess.Error = true;
                mess.Title = ex.Message;
            }
            return mess;
        }
        public virtual JMessage UploadImage(IFormFile fileUpload, string pathUpload)
        {
            var mess = new JMessage { Error = false, Title = "" };
            try
            {
                var filePath = Path.GetTempFileName();
                if (!Directory.Exists(pathUpload)) Directory.CreateDirectory(pathUpload);
                var fileName = FileExtensions.CleanFileName(Path.GetFileName(fileUpload.FileName));
                fileName = Path.GetFileNameWithoutExtension(fileName)
                          + "_"
                          + Guid.NewGuid().ToString().Substring(0, 8)
                          + Path.GetExtension(fileName);
                var fullPath = Path.Combine(pathUpload, fileName);
                using (var stream = new FileStream(fullPath, FileMode.Create))
                {
                    fileUpload.CopyTo(stream);
                }
                mess.Object = fileName;
            }
            catch (Exception ex)
            {
                mess.Error = true;
                mess.Title = ex.Message;
            }
            return mess;
        }
        public virtual JMessage UploadImage(Image fileUpload, string fileName)
        {
            var mess = new JMessage { Error = false, Title = "" };
            try
            {
                var filePath = Path.GetTempFileName();
                var pathUpload = Path.Combine(_hostingEnvironment.WebRootPath, "uploads\\images");
                if (!Directory.Exists(pathUpload)) Directory.CreateDirectory(pathUpload);
                fileUpload.GetThumbnailImage(200, 260, null, IntPtr.Zero);
                fileUpload.Save(pathUpload + "\\" + fileName);
                mess.Object = fileName;
            }
            catch (Exception ex)
            {
                mess.Error = true;
                mess.Title = ex.Message;
            }
            return mess;
        }
        public Image Base64ToImage(string base64String)
        {
            // Convert Base64 String to byte[]
            byte[] imageBytes = Convert.FromBase64String(base64String);
            MemoryStream ms = new MemoryStream(imageBytes, 0, imageBytes.Length);

            // Convert byte[] to Image
            ms.Write(imageBytes, 0, imageBytes.Length);
            Image image = Image.FromStream(ms, true);

            return image;
        }

        public JMessage UploadFileByBytes(byte[] bytes, string fileName1, string root, string pathUpload)
        {
            var mess = new JMessage { Error = false, Title = "" };
            try
            {
                var path = pathUpload;
                pathUpload = Path.Combine(root, pathUpload);
                var filePath = Path.GetTempFileName();
                if (!Directory.Exists(pathUpload)) Directory.CreateDirectory(pathUpload);
                var fileName = FileExtensions.CleanFileName(Path.GetFileName(fileName1));
                fileName = Path.GetFileNameWithoutExtension(fileName)
                          + "_"
                          + Guid.NewGuid().ToString().Substring(0, 8)
                          + Path.GetExtension(fileName);
                var fullPath = Path.Combine(pathUpload, fileName);
                path = Path.Combine(path, fileName);
                using (var stream = new FileStream(fullPath, FileMode.Create))
                {
                    stream.Write(bytes,0, bytes.Length);
                    stream.Flush();
                }
                mess.Object = path;
            }
            catch (Exception ex)
            {
                mess.Error = true;
                mess.Title = ex.Message;
            }
            return mess;
        }
    }
    public class JmessageExtension : JMessage
    {
        public string FileName { get; set; }
    }
}
