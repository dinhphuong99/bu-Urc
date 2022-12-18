using System;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;

namespace III.Admin.Controllers
{

    [Area("Admin")]
    public class OrderRequestRawController : BaseController
    {
        public class CustomerRequestJtable : JTableModel
        {
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string Title { get; set; }
            public string Content { get; set; }
        }
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<OrderRequestRawController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;

        public OrderRequestRawController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment, IStringLocalizer<OrderRequestRawController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _upload = upload;
            _hostingEnvironment = hostingEnvironment;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }
        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public object JTable([FromBody]CustomerRequestJtable jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var query = from a in _context.OrderRequestRaws
                        join b in _context.OrderRequestRawFiless on a.ReqCode equals b.ReqCode into b1
                        from b2 in b1.DefaultIfEmpty()
                        where b2.IsMaster
                        && ((fromDate == null) || (a.RequestTime.HasValue && a.RequestTime.Value.Date >= fromDate.Value.Date))
                            && ((toDate == null) || (a.RequestTime.HasValue && a.RequestTime.Value.Date <= toDate.Value.Date))
                            && (string.IsNullOrEmpty(jTablePara.Title) || a.Title.ToLower().Contains(jTablePara.Title.ToLower()))
                            && (string.IsNullOrEmpty(jTablePara.Content) || a.Content.ToLower().Contains(jTablePara.Content.ToLower()))
                        select new
                        {
                            a.Id,
                            a.ReqCode,
                            a.Title,
                            a.Content,
                            a.Priority,
                            a.Email,
                            a.Phone,
                            a.RequestTime,
                            FilePath = b2.FilePath != null ? b2.FilePath : "/uploads/files/FileMasterDefault.xlsx",
                            FileType = b2.FileType != null ? b2.FileType : ".xlsx"
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).Select(x => new
            {
                x.Id,
                x.Title,
                x.Content,
                x.Priority,
                x.Email,
                x.Phone,
                x.RequestTime,
                x.FilePath,
                x.FileType,
                IsFile = _context.OrderRequestRawFiless.FirstOrDefault(y => y.ReqCode == x.ReqCode) != null ? true : false,
            }).AsNoTracking().ToList();
            var data1 = data.OrderByDescending(x => x.Priority).ToList();
            var jdata = JTableHelper.JObjectTable(data1, jTablePara.Draw, count, "Id", "Title", "Content", "Priority", "Email", "Phone", "RequestTime", "IsFile", "FilePath", "FileType");
            return Json(jdata);
        }


        [HttpPost]
        public JsonResult GetItem([FromBody]int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            var data = _context.OrderRequestRaws.FirstOrDefault(x => x.Id == id);
            if (data != null)
            {
                var model = new CustomerRequestModel
                {
                    Id = data.Id,
                    Title = data.Title,
                    Content = data.Content,
                    Status = data.Status,
                    Phone = data.Phone,
                    Email = data.Email,
                    Priority = data.Priority,
                    RequestTime = data.RequestTime != null ? data.RequestTime.Value.ToString("dd/MM/yyyy") : "",
                    Keyword = data.Keyword,
                    ListFile = _context.OrderRequestRawFiless.Where(x => x.ReqCode == data.ReqCode.ToString()).ToList(),
                };
                msg.Object = model;
            }
            else
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public object GetItemLogChange(int path)
        {
            var data = _context.LogChangeDocuments.Where(x => x.FileCode.Equals(path));
            return data;
        }

        [HttpPost]
        public JsonResult Insert([FromBody]CustomerRequestModel obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var requestCode = Guid.NewGuid().ToString();
                var customerRequest = new OrderRequestRaw
                {
                    ReqCode = requestCode,
                    Title = obj.Title,
                    Content = obj.Content,
                    Phone = obj.Phone,
                    Email = obj.Email,
                    Keyword = obj.Keyword,
                    Priority = obj.Priority,
                    CreatedTime = DateTime.Now,
                    RequestTime = !string.IsNullOrEmpty(obj.RequestTime) ? DateTime.ParseExact(obj.RequestTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null,
                    CreatedBy = ESEIM.AppContext.UserName,
                };
                _context.OrderRequestRaws.Add(customerRequest);
                if (obj.ListFile.Count == 0)
                {
                    var file = new OrderRequestRawFiles
                    {
                        ReqCode = customerRequest.ReqCode,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now,
                        FileName = "FileMasterDefault.xlsx",
                        FilePath = "/uploads/files/FileMasterDefault.xlsx",
                        FileType = ".xlsx",
                        IsMaster = true
                    };
                    _context.OrderRequestRawFiless.Add(file);
                }
                else
                {
                    foreach (var item in obj.ListFile)
                    {
                        var file = new OrderRequestRawFiles
                        {
                            ReqCode = customerRequest.ReqCode,
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now,
                            FileName = item.FileName,
                            FilePath = item.FilePath,
                            FileType = "." + item.FileType,
                            IsMaster = item.IsMaster
                        };
                        _context.OrderRequestRawFiless.Add(file);
                    }
                }

                _context.SaveChanges();
                msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], "");

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Update([FromBody]CustomerRequestModel obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                //header
                var data = _context.OrderRequestRaws.FirstOrDefault(x => x.Id == obj.Id);
                data.Title = obj.Title;
                data.Content = obj.Content;
                data.Phone = obj.Phone;
                data.Email = obj.Email;
                data.Keyword = obj.Keyword;
                data.Priority = obj.Priority;
                data.RequestTime = !string.IsNullOrEmpty(obj.RequestTime) ? DateTime.ParseExact(obj.RequestTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                _context.OrderRequestRaws.Update(data);
                //file
                var listFileNew = obj.ListFile.Where(x => x.Id < 0);
                foreach (var item in listFileNew)
                {
                    var file = new OrderRequestRawFiles
                    {
                        ReqCode = data.ReqCode,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now,
                        FileName = item.FileName,
                        FilePath = item.FilePath,
                        FileType = "." + item.FileType,
                        IsMaster = item.IsMaster
                    };
                    _context.OrderRequestRawFiless.Add(file);
                    _context.SaveChanges();
                }

                var listFileOld = obj.ListFile.Where(x => x.Id > 0);
                foreach (var item in listFileOld)
                {
                    _context.OrderRequestRawFiless.Update(item);
                }



                if (obj.ListDeletedFile.Any())
                {
                    var listFileDelete = _context.OrderRequestRawFiless.Where(x => obj.ListDeletedFile.Any(y => x.Id == y));
                    if (listFileDelete.Any())
                    {
                        _context.OrderRequestRawFiless.RemoveRange(listFileDelete);
                    }
                }

                _context.SaveChanges();
                msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], "");
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Cập nhật yêu cầu lỗi";
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateStatus([FromBody]CustomerRequestModel obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                //header
                var data = _context.OrderRequestRaws.FirstOrDefault(x => x.Id == obj.Id);
                data.Status = obj.Status;
                _context.OrderRequestRaws.Update(data);
                _context.SaveChanges();
                msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], "");
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Delete([FromBody]int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = _context.OrderRequestRaws.FirstOrDefault(x => x.Id == id);
                if (data != null)
                {
                    _context.OrderRequestRaws.Remove(data);
                    _context.SaveChanges();
                    // msg.Title = "Xóa yêu cầu thành công!";
                    msg.Title = String.Format(_sharedResources["COM_DELETE_SUCCESS"], "");
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "yêu cầu không tồn tại!";
                    msg.Title = String.Format(_sharedResources["COM_MSG_NOT_EXITS"], _stringLocalizer["ORR_LBL_ORR_NAME"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi xảy ra khi xóa!";
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }


        [HttpPost]
        [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
        [RequestSizeLimit(long.MaxValue)]
        public JsonResult UploadFile(IFormFile file)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var userId = ESEIM.AppContext.UserId;
            var User = _context.Users.FirstOrDefault(x => x.Id == userId);
            var upload = _upload.UploadFile(file, Path.Combine(_hostingEnvironment.WebRootPath, "uploads\\files"));
            if (upload.Error)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_ERR_FAIL_DOWLOAD"], _sharedResources["COM_FILE"]) + upload.Title;
            }
            else
            {
                msg.Object = new
                {
                    Source = "/uploads/Files/" + upload.Object.ToString(),
                    User = User?.GivenName,
                };
                msg.Title = String.Format(_sharedResources["COM_ERR_SUCCESS_DOWLOAD"], _sharedResources["COM_FILE"]);
            }
            return Json(msg);
        }

        [HttpGet]
        public JsonResult GetListFile(int? id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.OrderRequestRaws.FirstOrDefault(x => x.Id == id);
                if (data != null)
                {
                    var listFile = _context.OrderRequestRawFiless.Where(x => x.ReqCode == data.ReqCode);
                    msg.Object = listFile;
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                //msg.Title = "Có lỗi khi lấy dữ liệu";
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpGet]
        public object GetPathFile(string filePath)
        {
            var extension = Path.GetExtension(filePath);
            var attachment = _context.OrderRequestRawFiless.FirstOrDefault(x => x.FilePath == filePath && !x.IsDeleted);
            var asean = new AseanDocument();
            //asean.File_Code = attachment.ReqCode;
            if (extension.ToUpper() == ".DOCX" || extension.ToUpper() == ".DOC")
            {
                SyncfusionController.pathFile = filePath;
                SyncfusionController.docmodel = asean;
            }
            if (extension.ToUpper() == ".XLSX" || extension.ToUpper() == ".XLS")
            {
                ExcelController.pathFile = filePath;
                ExcelController.docmodel = asean;
            }
            if (extension.ToUpper() == ".PDF")
            {
                PDFController.pathFile = filePath;
            }

            attachment.UpdatedTime = DateTime.Now;
            _context.SaveChanges();
            return attachment;
        }

        #region LogDocs
        [HttpPost]
        public object JTablLogchange([FromBody]LogChange jTablePara)
        {
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = (from a in _context.LogChangeDocuments
                         join b in _context.Users on a.UserID equals b.Id into b1
                         from b2 in b1.DefaultIfEmpty()
                         where (a.FileCode.Equals(jTablePara.FileCode) && !a.IsDeleted)
                         select new
                         {
                             a.ID,
                             a.LogContent,
                             a.CreatedTime,
                             //a.UserID,
                             UserID = b2.UserName,
                             a.FileName,
                             a.FileCode,
                             a.LogText
                         }).AsParallel();
            int count = query.Count();
            var data = query.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length);
            var jdata = JTableHelper.JObjectTable(data.ToList(), jTablePara.Draw, count, "ID", "LogContent", "CreatedTime", "UserID", "FileName", "FileCode", "LogText");
            return Json(jdata);
        }

        public class LogChange : JTableModel
        {
            public string FileCode { get; set; }
        }
        #endregion
        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var a = _stringLocalizer["ORR_CURD_BTN_ADD_FILE"];
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }).Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion
    }
}