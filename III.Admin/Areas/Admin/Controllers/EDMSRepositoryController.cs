using System;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Utils;
using ESEIM.Models;
using FTU.Utils.HelperNet;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;
using System.Drawing;
using System.Drawing.Imaging;
using III.Domain.Enums;
using System.Net;
using System.ComponentModel.DataAnnotations;
using Syncfusion.DocIO;
using Aspose.Pdf;
using Aspose.Pdf.Text;
using Aspose.Pdf.Annotations;
using Syncfusion.XlsIO;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class EDMSRepositoryController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<EDMSRepositoryController> _stringLocalizer;
        private readonly IStringLocalizer<ContractController> _contractController;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        string[] word = { ".DOC", ".DOCX" };
        string[] pdf = { ".PDF" };
        string[] excel = { ".XLSX", ".XLS" };
        public EDMSRepositoryController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment, IStringLocalizer<EDMSRepositoryController> stringLocalizer, IStringLocalizer<ContractController> contractController, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _hostingEnvironment = hostingEnvironment;
            _upload = upload;
            _stringLocalizer = stringLocalizer;
            _contractController = contractController;
            _sharedResources = sharedResources;
        }
        public IActionResult Index()
        {
            return View();
        }

        #region Category
        public class CategoryModel
        {
            public EDMSCategory Category { get; set; }
            [Required]
            public string ReposCode { get; set; }
            public string TypeRepos { get; set; }
            public List<Repository> ListRepository { get; set; }
        }
        public class Repository
        {
            public string FolderName { get; set; }
            public string Path { get; set; }
            public string FolderId { get; set; }
        }
        [HttpPost]
        public List<TreeViewResource> GetTreeCategory()
        {
            var data = _context.EDMSCategorys.Where(x => x.IsDeleted == false).OrderByDescending(x => x.Id).AsNoTracking();
            var dataOrder = GetSubTreeCategoryData(data.ToList(), null, new List<TreeViewResource>(), 0, 2);
            return dataOrder;
        }

        [HttpGet]
        public JsonResult GetItemCategory(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var model = new CategoryModel();
                var category = _context.EDMSCategorys.FirstOrDefault(x => x.Id == id);
                if (category != null)
                {
                    model.Category = category;
                    var repository = _context.EDMSCatRepoSettings.Where(x => x.CatCode == category.CatCode);
                    model.ReposCode = repository.GroupBy(x => x.ReposCode).Select(x => x.Key).FirstOrDefault();
                    model.ListRepository = repository.Select(x => new Repository { Path = x.Path, FolderName = x.FolderName }).ToList();
                    model.TypeRepos = repository.FirstOrDefault(x => string.IsNullOrEmpty(x.FolderId)) != null ? EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server) : EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.GooglerDriver);
                    msg.Object = model;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_MSG_ERR"];//"Xóa file lỗi";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = _sharedResources["COM_MSG_ERR"];//"Xóa file lỗi";
            }
            return Json(msg);
        }

        [HttpPost]
        public object GetParentCategory([FromBody]TempSub obj)
        {
            if (obj.IdI == null)
            {
                var data = _context.EDMSCategorys.Where(x => x.IsDeleted == false).OrderBy(x => x.Id).AsNoTracking();
                var dataOrder = GetSubTreeCategoryData(data.ToList(), null, new List<TreeViewResource>(), 0, 1);
                return dataOrder;
            }
            else
            {
                string reposCode = _context.EDMSCategorys.Where(x => x.Id == obj.IdI[0]).Select(x => x.CatCode).FirstOrDefault();
                var data = _context.EDMSCategorys.Where(x => (x.CatCode != reposCode && x.CatParent != reposCode)).OrderByDescending(x => x.Id).AsNoTracking();
                var dataOrder = GetSubTreeCategoryData(data.ToList(), null, new List<TreeViewResource>(), 0, 1);
                return dataOrder;
            }
        }

        [HttpPost]
        public JsonResult InsertCategory([FromBody]CategoryModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                //check exist code
                var checkExistCode = _context.EDMSCategorys.FirstOrDefault(x => x.CatCode == obj.Category.CatCode && x.IsDeleted == false);
                if (checkExistCode != null)
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["EDMSR_MSG_CATEGORY_CODE_EXIST"];//"Mã kho dữ liệu đã tồn tại";
                }
                else
                {
                    //add category
                    obj.Category.CatParent = string.IsNullOrEmpty(obj.Category.CatParent) ? "#" : obj.Category.CatParent;
                    obj.Category.CreatedBy = ESEIM.AppContext.UserName;
                    obj.Category.CreatedTime = DateTime.Now;
                    _context.EDMSCategorys.Add(obj.Category);

                    //add repository
                    foreach (var item in obj.ListRepository)
                    {
                        var reposSetting = new EDMSCatRepoSetting
                        {
                            CatCode = obj.Category.CatCode,
                            ReposCode = obj.ReposCode,
                            Path = obj.TypeRepos == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server) ? item.Path : "",
                            FolderId = obj.TypeRepos == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.GooglerDriver) ? item.FolderId : "",
                            FolderName = item.FolderName
                        };
                        _context.EDMSCatRepoSettings.Add(reposSetting);
                    }
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = _sharedResources["COM_MSG_ERR"];//"Xóa file lỗi";
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateCategory([FromBody]CategoryModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.EDMSCategorys.FirstOrDefault(x => x.Id == obj.Category.Id);
                if (data != null)
                {
                    data.CatName = obj.Category.CatName;
                    if (data.CatParent != obj.Category.CatParent)
                    {
                        data.CatParent = string.IsNullOrEmpty(obj.Category.CatParent) ? "#" : obj.Category.CatParent;
                    }
                    _context.EDMSCategorys.Update(data);

                    //remove repository
                    var category = _context.EDMSCatRepoSettings.Where(x => x.CatCode == obj.Category.CatCode);
                    if (category.Any())
                    {
                        _context.EDMSCatRepoSettings.RemoveRange(category);
                    }

                    //add repository
                    foreach (var item in obj.ListRepository)
                    {
                        var reposSetting = new EDMSCatRepoSetting
                        {
                            CatCode = obj.Category.CatCode,
                            ReposCode = obj.ReposCode,
                            Path = obj.TypeRepos == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server) ? item.Path : "",
                            FolderId = obj.TypeRepos == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.GooglerDriver) ? item.FolderId : "",
                            FolderName = item.FolderName
                        };
                        _context.EDMSCatRepoSettings.Add(reposSetting);
                    }
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["EDMSR_MSG_DATA_NOT_EXIST"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = _sharedResources["COM_MSG_ERR"];//"Xóa file lỗi";
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult DeleteCategory(string catCode)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var cat = _context.EDMSCategorys.FirstOrDefault(x => x.CatCode == catCode && x.IsDeleted == false);
                var getListChild = _context.EDMSCategorys.Where(x => x.CatParent == cat.CatCode);
                if (getListChild.Any())
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["EDMSR_MSG_NO_DELETE_CHILD"];
                }
                else
                {
                    cat.IsDeleted = true;
                    _context.EDMSCategorys.Update(cat);
                    _context.SaveChanges();
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [NonAction]
        private List<TreeViewResource> GetSubTreeCategoryData(List<EDMSCategory> data, string parentid, List<TreeViewResource> lstCategories, int tab, int typeOrder)
        {
            //tab += "- ";
            var contents = string.IsNullOrEmpty(parentid)
                ? (typeOrder == 1 ? data.Where(x => x.CatParent == "#").OrderBy(x => x.Id).AsParallel() : data.Where(x => x.CatParent == "#").OrderByDescending(x => x.Id).AsParallel())
                : data.Where(x => x.CatParent == parentid).OrderByDescending(x => x.Id).AsParallel();
            foreach (var item in contents)
            {
                var category = new TreeViewResource
                {
                    Id = item.Id,
                    Code = item.CatCode,
                    Title = item.CatName,
                    Level = tab,
                    HasChild = data.Any(x => x.CatParent == item.CatCode),
                    ParentCode = item.CatParent,
                };
                lstCategories.Add(category);
                if (category.HasChild) GetSubTreeCategoryData(data, item.CatCode, lstCategories, tab + 1, 1);
            }
            return lstCategories;
        }

        [HttpPost]
        public List<TreeViewResource> GetTreeInNode(string parentId)
        {
            var data = _context.EDMSCategorys.Where(x => x.IsDeleted == false).OrderByDescending(x => x.Id).AsNoTracking();
            var tree = GetSubTreeCategoryData(data.ToList(), parentId, new List<TreeViewResource>(), 0, 2);
            return tree;
        }
        #endregion

        #region Repository
        [HttpPost]
        public List<TreeViewResource> GetTreeRepository()
        {
            var data = _context.EDMSRepositorys.Where(x => x.IsDeleted == false).OrderByDescending(x => x.ReposID).AsNoTracking();
            var dataOrder = GetSubTreeRepositoryData(data.ToList(), null, new List<TreeViewResource>(), 0, 2);
            return dataOrder;
        }

        [HttpGet]
        public JsonResult GetItemRepository(string reposCode)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == reposCode);
                if (data != null)
                {
                    var model = new EDMSRepository
                    {
                        ReposID = data.ReposID,
                        ReposName = data.ReposName,
                        Server = data.Server,
                        Account = data.Account,
                        PassWord = data.PassWord,
                        Token = data.Token,
                        Desc = data.Desc,
                    };
                    msg.Object = model;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["EDMSR_MSG_SERVER_NOT_EXIST"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = _sharedResources["COM_MSG_ERR"];//"Xóa file lỗi";
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult InsertRepository([FromBody]EDMSRepository obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                obj.Parent = "#";
                obj.ReposCode = string.Concat("RES", DateTime.Now.ToString("ddMMyyyhhmmss"));
                obj.CreatedBy = ESEIM.AppContext.UserName;
                obj.CreatedTime = DateTime.Now;
                _context.EDMSRepositorys.Add(obj);
                _context.SaveChanges();
                msg.Title = _sharedResources["COM_ADD_SUCCESS"];
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
        public JsonResult UpdateRepository([FromBody]EDMSRepository obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposID == obj.ReposID);
                if (data != null)
                {
                    data.ReposName = obj.ReposName;
                    data.Server = obj.Server;
                    data.Account = obj.Account;
                    data.PassWord = obj.PassWord;
                    data.Desc = obj.Desc;
                    data.UpdatedBy = ESEIM.AppContext.UserName;
                    data.UpdatedTime = DateTime.Now;
                    _context.EDMSRepositorys.Update(data);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["EDMSR_MSG_SERVER_NOT_EXIST"];
                }
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
        public JsonResult DeleteRepository(string respos)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var res = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == respos && x.IsDeleted == false);
                res.IsDeleted = true;
                _context.EDMSRepositorys.Update(res);
                _context.SaveChanges();
                msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = _sharedResources["COM_MSG_ERR"];//"Xóa file lỗi";
            }
            return Json(msg);
        }

        [NonAction]
        private List<TreeViewResource> GetSubTreeRepositoryData(List<EDMSRepository> data, string parentid, List<TreeViewResource> lstCategories, int tab, int typeOrder)
        {
            var contents = string.IsNullOrEmpty(parentid)
                ? (typeOrder == 1 ? data.Where(x => x.Parent == "#").OrderBy(x => x.ReposID).AsParallel() : data.Where(x => x.Parent == "#").OrderByDescending(x => x.ReposID).AsParallel())
                : data.Where(x => x.Parent == parentid).OrderByDescending(x => x.ReposID).AsParallel();
            foreach (var item in contents)
            {
                var category = new TreeViewResource
                {
                    Id = item.ReposID,
                    Code = item.ReposCode,
                    Title = item.ReposName,
                    Level = tab,
                    HasChild = data.Any(x => x.Parent == item.ReposCode),
                    ParentCode = item.Parent,
                    TypeRepos = item.Type,
                };
                lstCategories.Add(category);
                if (category.HasChild) GetSubTreeRepositoryData(data, item.ReposCode, lstCategories, tab + 1, 1);
            }
            return lstCategories;
        }
        #endregion

        #region File
        [HttpPost]
        public object GetContract()
        {
            var contract = _context.PoSaleHeaders.AsParallel().Where(x => !x.IsDeleted).Select(x => new { Code = x.ContractCode, Name = x.Title });
            return contract;
        }

        [HttpGet]
        public JsonResult GetFileImage(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var file = _context.EDMSFiles.FirstOrDefault(x => x.FileID == id);
            if (file != null)
            {
                using (System.Drawing.Image image = System.Drawing.Image.FromFile(_hostingEnvironment.WebRootPath + file.Url))
                {
                    using (MemoryStream m = new MemoryStream())
                    {
                        image.Save(m, ImageFormat.Png);
                        byte[] imageBytes = m.ToArray();
                        // Convert byte[] to Base64 String
                        string base64String = System.Convert.ToBase64String(imageBytes);
                        msg.Object = base64String;
                    }
                }
            }
            return Json(msg);
        }

        //[HttpPost]
        //public object JTableFileNew([FromBody]JtableFileModel jTablePara)
        //{
        //    int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
        //    var listType = new string[] { };
        //    if (jTablePara.FileType == 1)
        //    {
        //        listType = new string[] { ".jpg", ".png", ".tif", ".tiff" };
        //    }
        //    else if (jTablePara.FileType == 2)
        //    {
        //        listType = new string[] { ".docx", ".doc" };
        //    }
        //    else if (jTablePara.FileType == 3)
        //    {
        //        listType = new string[] { ".xlsm", ".xlsx", ".xlsb", ".xltx", ".xltm", ".xls", ".xlt", ".xls", ".xml", ".xml", ".xlam", ".xla", ".xlw", ".xlr" };
        //    }
        //    else if (jTablePara.FileType == 4)
        //    {
        //        listType = new string[] { ".pps", "ppt", ".pptx" };
        //    }
        //    else if (jTablePara.FileType == 5)
        //    {
        //        listType = new string[] { ".pdf" };
        //    }
        //    else if (jTablePara.FileType == 6)
        //    {
        //        listType = new string[] { ".txt" };
        //    }
        //    var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
        //    var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

        //    var queryContract = from a in _context.PoSaleHeaders
        //                                          .Where(x => x.IsDeleted == false)
        //                        join b in _context.EDMSRepoCatFiles on a.ContractCode equals b.ObjectCode
        //                        where (string.IsNullOrEmpty(jTablePara.ContractCode) || a.ContractCode == jTablePara.ContractCode)
        //                        && (string.IsNullOrEmpty(jTablePara.ObjectCode) || jTablePara.ObjectCode == "FILE_OBJ_CONTRACT")
        //                        select new
        //                        {
        //                            b.FileCode
        //                        };

        //    var queryCustomer = from a in _context.Customerss
        //                           .Where(x => x.IsDeleted == false)
        //                        join b in _context.EDMSRepoCatFiles on a.CusCode equals b.ObjectCode
        //                        where (string.IsNullOrEmpty(jTablePara.CustomerCode) || a.CusCode == jTablePara.CustomerCode)
        //                        && (string.IsNullOrEmpty(jTablePara.ObjectCode) || jTablePara.ObjectCode == "FILE_OBJ_CUSTOMMER")
        //                        select new
        //                        {
        //                            b.FileCode
        //                        };
        //    var querySupplier = from a in _context.Suppliers
        //                           .Where(x => x.IsDeleted == false)
        //                        join b in _context.EDMSRepoCatFiles on a.SupCode equals b.ObjectCode
        //                        where (string.IsNullOrEmpty(jTablePara.SupplierCode) || a.SupCode == jTablePara.SupplierCode)
        //                        && (string.IsNullOrEmpty(jTablePara.ObjectCode) || jTablePara.ObjectCode == "FILE_OBJ_SUPPLIER")
        //                        select new
        //                        {
        //                            b.FileCode
        //                        };
        //    var queryProject = from a in _context.Projects
        //                       join b in _context.EDMSRepoCatFiles on a.ProjectCode equals b.ObjectCode
        //                       where (string.IsNullOrEmpty(jTablePara.ProjectCode) || a.ProjectCode == jTablePara.ProjectCode)
        //                       && (string.IsNullOrEmpty(jTablePara.ObjectCode) || jTablePara.ObjectCode == "FILE_OBJ_PROJECT")
        //                       select new
        //                       {
        //                           b.FileCode
        //                       };
        //    var queryOther = from a in _context.EDMSRepoCatFiles.Where(x => x.ObjectType == null && x.ObjectCode == null)
        //                     where (string.IsNullOrEmpty(jTablePara.ObjectCode) || jTablePara.ObjectCode == "FILE_OBJ_OTHER")
        //                     select new
        //                     {
        //                         a.FileCode
        //                     };
        //    var queryOther1 = from a in _context.EDMSRepoCatFiles.Where(x => x.ObjectType == "PRODUCT")
        //                      select new
        //                      {
        //                          a.FileCode
        //                      };

        //    var query1 = queryContract.Union(queryCustomer.Union(querySupplier.Union(queryProject.Union(queryOther.Union(queryOther1)))));
        //    if (!string.IsNullOrEmpty(jTablePara.Content))
        //    {
        //        var queryLucene = SearchLuceneFile(jTablePara.Content, intBeginFor, jTablePara.Length);
        //        //var queryLucene = queryLucene1.listLucene.GroupBy(x => x.FileCode).Select(x => new EDMSJtableFileModel
        //        //{
        //        //    FileCode = x.Key,
        //        //    Content = string.Join(System.Environment.NewLine, x.Select(y => y.Content))
        //        //});
        //        var queryDataLucene1 =
        //            (from a in queryLucene.listLucene
        //             join c in _context.EDMSFiles.Where(x => !x.IsDeleted) on a.FileCode equals c.FileCode
        //             join e in query1 on c.FileCode equals e.FileCode
        //             join b in _context.EDMSRepoCatFiles on a.FileCode equals b.FileCode
        //             //from b in b1.DefaultIfEmpty()
        //             join d in _context.EDMSRepositorys on c.ReposCode equals d.ReposCode into d2
        //             from d in d2.DefaultIfEmpty()
        //                 //join f in _context.EDMSCatRepoSettings on b.FolderId equals f.FolderId into f2
        //                 //from f in f2.DefaultIfEmpty()
        //             where ((fromDate == null) || (c.CreatedTime.HasValue && c.CreatedTime.Value.Date >= fromDate))
        //             && ((toDate == null) || (c.CreatedTime.HasValue && c.CreatedTime.Value.Date <= toDate))
        //             && (string.IsNullOrEmpty(jTablePara.Name) || (!string.IsNullOrEmpty(c.FileName) && c.FileName.ToLower().Contains(jTablePara.Name.ToLower())))
        //             && (string.IsNullOrEmpty(jTablePara.Tags) || (!string.IsNullOrEmpty(c.Tags) && c.Tags.ToLower().Contains(jTablePara.Tags.ToLower())))
        //             && (listType.Length == 0 || (listType.Any(x => x.ToLower() == c.FileTypePhysic.ToLower())))
        //             && (string.IsNullOrEmpty(jTablePara.UserUpload) || (c.CreatedBy == jTablePara.UserUpload))
        //             select new EDMSJtableFileModel
        //             {
        //                 Id = b != null ? b.Id : -1,
        //                 FileID = c.FileID,
        //                 FileName = c.FileName,
        //                 FileTypePhysic = c.FileTypePhysic,
        //                 CreatedBy = c.CreatedBy,
        //                 CreatedTime = c.CreatedTime,
        //                 Tags = c.Tags,
        //                 Content = a.Content,
        //                 Url = c.Url,
        //                 MimeType = c.MimeType,
        //                 ReposName = d != null ? d.ReposName : "",
        //                 CloudFileId = c.CloudFileId,
        //                 ServerAddress = d != null ? d.Server : "",
        //                 Category = b != null ? b.CatCode : "",
        //                 //FolderName = f != null ? f.FolderName : "",
        //                 FileSize = c.FileSize.Value
        //             });
        //        var Capacity = queryDataLucene1.Sum(x => x.FileSize);
        //        var queryDataLucene = queryDataLucene1.Skip(intBeginFor).Take(jTablePara.Length).ToList();
        //        foreach (var item in queryDataLucene)
        //        {
        //            item.FileSize = Capacity;
        //        }
        //        var countLucene = (from a in queryLucene.listLucene
        //                           join c in _context.EDMSFiles.Where(x => !x.IsDeleted) on a.FileCode equals c.FileCode
        //                           join e in query1 on c.FileCode equals e.FileCode
        //                           where ((fromDate == null) || (c.CreatedTime.HasValue && c.CreatedTime.Value.Date >= fromDate))
        //                           && ((toDate == null) || (c.CreatedTime.HasValue && c.CreatedTime.Value.Date <= toDate))
        //                           && (string.IsNullOrEmpty(jTablePara.Name) || (!string.IsNullOrEmpty(c.FileName) && c.FileName.ToLower().Contains(jTablePara.Name.ToLower())))
        //                           && (string.IsNullOrEmpty(jTablePara.Tags) || (!string.IsNullOrEmpty(c.Tags) && c.Tags.ToLower().Contains(jTablePara.Tags.ToLower())))
        //                           && (listType.Length == 0 || (listType.Any(x => x.ToLower() == c.FileTypePhysic.ToLower())))
        //                           && (string.IsNullOrEmpty(jTablePara.UserUpload) || (c.CreatedBy == jTablePara.UserUpload))
        //                           select a).Count();
        //        var jdata = JTableHelper.JObjectTable(queryDataLucene, jTablePara.Draw, countLucene, "FileID", "FileName", "FileTypePhysic", "CreatedBy", "CreatedTime", "Tags", "Url", "Content", "MimeType", "Id", "ReposName", "CloudFileId", "ServerAddress", "Category", "FolderName", "FileSize");
        //        return Json(jdata);
        //    }
        //    else
        //    {
        //        var query2 = (from a in _context.EDMSFiles
        //                      join e in query1 on a.FileCode equals e.FileCode
        //                      join b in _context.EDMSRepoCatFiles on a.FileCode equals b.FileCode
        //                      //from b in b1.DefaultIfEmpty()
        //                      join d in _context.EDMSRepositorys on a.ReposCode equals d.ReposCode into d2
        //                      from d in d2.DefaultIfEmpty()
        //                          //join f in _context.EDMSCatRepoSettings on b.FolderId equals f.FolderId into f2
        //                          //from f in f2.DefaultIfEmpty()
        //                      where ((fromDate == null) || (a.CreatedTime.HasValue && a.CreatedTime.Value.Date >= fromDate))
        //                          && (string.IsNullOrEmpty(jTablePara.UserUpload) || (a.CreatedBy == jTablePara.UserUpload))
        //                          && ((toDate == null) || (a.CreatedTime.HasValue && a.CreatedTime.Value.Date <= toDate))
        //                          && (string.IsNullOrEmpty(jTablePara.Name) || a.FileName.ToLower().Contains(jTablePara.Name.ToLower()))
        //                          && (string.IsNullOrEmpty(jTablePara.Tags) || a.Tags.ToLower().Contains(jTablePara.Tags.ToLower()))
        //                          && (listType.Length == 0 || (listType.Any(x => x == a.FileTypePhysic)))
        //                          && (jTablePara.ListRepository.Length == 0 || (jTablePara.ListRepository.Any(x => x == b.CatCode)))
        //                          && ((string.IsNullOrEmpty(jTablePara.TypeTab) || (jTablePara.TypeTab == EnumHelper<ProjectEnum>.GetDisplayValue(ProjectEnum.Project) && _context.ProjectFiles.Any(x => x.FileCode == a.FileCode)))
        //                          || (string.IsNullOrEmpty(jTablePara.TypeTab) || (jTablePara.TypeTab == EnumHelper<CustomerEnum>.GetDisplayValue(CustomerEnum.Customer) && _context.CustomerFiles.Any(x => x.FileCode == a.FileCode)))
        //                          || (string.IsNullOrEmpty(jTablePara.TypeTab) || (jTablePara.TypeTab == EnumHelper<SupplierEnum>.GetDisplayValue(SupplierEnum.Supplier) && _context.SupplierFiles.Any(x => x.FileCode == a.FileCode)))
        //                          || (string.IsNullOrEmpty(jTablePara.TypeTab) || (jTablePara.TypeTab == EnumHelper<ContractEnum>.GetDisplayValue(ContractEnum.Contract) && _context.ContractFiles.Any(x => x.FileCode == a.FileCode))))
        //                      select new { a, b, d });
        //        var Capacity = query2.Sum(x => x.a.FileSize.Value);
        //        var query = query2.OrderByDescending(x => x.a.FileID).AsNoTracking().Skip(intBeginFor).Take(jTablePara.Length).ToList();
        //        var count = (from a in _context.EDMSFiles
        //                     join e in query1 on a.FileCode equals e.FileCode
        //                     join b in _context.EDMSRepoCatFiles on a.FileCode equals b.FileCode
        //                     where ((fromDate == null) || (a.CreatedTime.HasValue && a.CreatedTime.Value.Date >= fromDate))
        //                         && (string.IsNullOrEmpty(jTablePara.UserUpload) || (a.CreatedBy == jTablePara.UserUpload))
        //                         && ((toDate == null) || (a.CreatedTime.HasValue && a.CreatedTime.Value.Date <= toDate))
        //                         && (string.IsNullOrEmpty(jTablePara.Name) || a.FileName.ToLower().Contains(jTablePara.Name.ToLower()))
        //                         && (string.IsNullOrEmpty(jTablePara.Tags) || a.Tags.ToLower().Contains(jTablePara.Tags.ToLower()))
        //                         && (listType.Length == 0 || (listType.Any(x => x == a.FileTypePhysic)))
        //                         && (jTablePara.ListRepository.Length == 0 || (jTablePara.ListRepository.Any(x => x == b.CatCode)))
        //                         && ((string.IsNullOrEmpty(jTablePara.TypeTab) || (jTablePara.TypeTab == EnumHelper<ProjectEnum>.GetDisplayValue(ProjectEnum.Project) && _context.ProjectFiles.Any(x => x.FileCode == a.FileCode)))
        //                         || (string.IsNullOrEmpty(jTablePara.TypeTab) || (jTablePara.TypeTab == EnumHelper<CustomerEnum>.GetDisplayValue(CustomerEnum.Customer) && _context.CustomerFiles.Any(x => x.FileCode == a.FileCode)))
        //                         || (string.IsNullOrEmpty(jTablePara.TypeTab) || (jTablePara.TypeTab == EnumHelper<SupplierEnum>.GetDisplayValue(SupplierEnum.Supplier) && _context.SupplierFiles.Any(x => x.FileCode == a.FileCode)))
        //                         || (string.IsNullOrEmpty(jTablePara.TypeTab) || (jTablePara.TypeTab == EnumHelper<ContractEnum>.GetDisplayValue(ContractEnum.Contract) && _context.ContractFiles.Any(x => x.FileCode == a.FileCode))))
        //                     select a).AsNoTracking().Count();
        //        var list = query.Select(x => new
        //        {
        //            Id = x.b != null ? x.b.Id : -1,
        //            x.a.FileID,
        //            x.a.FileName,
        //            x.a.FileTypePhysic,
        //            x.a.CreatedBy,
        //            x.a.CreatedTime,
        //            x.a.Tags,
        //            x.a.Url,
        //            x.a.MimeType,
        //            ReposName = x.d != null ? x.d.ReposName : "",
        //            CloudFileId = x.a.CloudFileId,
        //            ServerAddress = x.d != null ? x.d.Server : "",
        //            Category = x.b != null ? x.b.CatCode : "",
        //            //FolderName = x.f != null ? x.f.FolderName : "",
        //            FileSize = Capacity
        //        }).ToList();
        //        var jdata = JTableHelper.JObjectTable(list, jTablePara.Draw, count, "FileID", "FileName", "FileTypePhysic", "CreatedBy", "CreatedTime", "Tags", "Url", "MimeType", "Id", "ReposName", "CloudFileId", "ServerAddress", "Category", "FolderName", "FileSize");
        //        return Json(jdata);
        //    }
        //}

        [HttpPost]
        public object JTableFile([FromBody]JtableFileModel jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var listType = new string[] { };
            if (jTablePara.FileType == 1)
            {
                listType = new string[] { ".jpg", ".png", ".tif", ".tiff" };
            }
            else if (jTablePara.FileType == 2)
            {
                listType = new string[] { ".docx", ".doc" };
            }
            else if (jTablePara.FileType == 3)
            {
                listType = new string[] { ".xlsm", ".xlsx", ".xlsb", ".xltx", ".xltm", ".xls", ".xlt", ".xls", ".xml", ".xml", ".xlam", ".xla", ".xlw", ".xlr" };
            }
            else if (jTablePara.FileType == 4)
            {
                listType = new string[] { ".pps", "ppt", ".pptx" };
            }
            else if (jTablePara.FileType == 5)
            {
                listType = new string[] { ".pdf" };
            }
            else if (jTablePara.FileType == 6)
            {
                listType = new string[] { ".txt" };
            }
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            if (!string.IsNullOrEmpty(jTablePara.Content))
            {
                var queryLucene = SearchLuceneFile(jTablePara.Content, intBeginFor, jTablePara.Length);
                var queryDataLucene =
                    (from a in queryLucene.listLucene
                     join c in _context.EDMSFiles.Where(x => !x.IsDeleted && (x.IsFileMaster == null || x.IsFileMaster == true)) on a.FileCode equals c.FileCode
                     join b in _context.EDMSRepoCatFiles on a.FileCode equals b.FileCode
                     join d in _context.EDMSRepositorys on c.ReposCode equals d.ReposCode into d2
                     from d in d2.DefaultIfEmpty()
                     join e in _context.EDMSCategorys.Where(x => !x.IsDeleted) on b.CatCode equals e.CatCode into e1
                     from e2 in e1.DefaultIfEmpty()
                     where ((fromDate == null) || (c.CreatedTime.HasValue && c.CreatedTime.Value.Date >= fromDate))
                     && ((toDate == null) || (c.CreatedTime.HasValue && c.CreatedTime.Value.Date <= toDate))
                     && (string.IsNullOrEmpty(jTablePara.Name) || (!string.IsNullOrEmpty(c.FileName) && c.FileName.ToLower().Contains(jTablePara.Name.ToLower())))
                     && (string.IsNullOrEmpty(jTablePara.Tags) || (!string.IsNullOrEmpty(c.Tags) && c.Tags.ToLower().Contains(jTablePara.Tags.ToLower())))
                     && (listType.Length == 0 || (listType.Any(x => x.ToLower() == c.FileTypePhysic.ToLower())))
                     && (string.IsNullOrEmpty(jTablePara.ObjectType) || (jTablePara.ObjectType == EnumHelper<All>.GetDisplayValue(All.All)) || b.ObjectType == jTablePara.ObjectType)
                     && (string.IsNullOrEmpty(jTablePara.ObjectCode) || b.ObjectCode == jTablePara.ObjectCode)
                     && (string.IsNullOrEmpty(jTablePara.UserUpload) || (c.CreatedBy == jTablePara.UserUpload))
                     select new EDMSJtableFileModel
                     {
                         Id = b.Id,
                         FileID = c.FileID,
                         FileName = c.FileName,
                         FileTypePhysic = c.FileTypePhysic,
                         CreatedBy = c.CreatedBy,
                         CreatedTime = c.CreatedTime,
                         Tags = c.Tags,
                         Content = a.Content,
                         Url = c.Url,
                         MimeType = c.MimeType,
                         ReposName = d != null ? d.ReposName : "",
                         CloudFileId = c.CloudFileId,
                         ServerAddress = d != null ? d.Server : "",
                         Category = b.CatCode,
                         FileSize = c.FileSize.HasValue ? c.FileSize.Value : 0,
                         SizeOfFile = c.FileSize.HasValue ? c.FileSize.Value : 0,
                         CatName = e2 != null ? e2.CatName : ""
                     });
                var capacity = queryDataLucene.Sum(x => x.FileSize);
                var paggingLucene = queryDataLucene.Skip(intBeginFor).Take(jTablePara.Length).ToList();
                foreach (var item in queryDataLucene)
                {
                    item.FileSize = capacity;
                }
                var countLucene = (from a in queryLucene.listLucene
                                   join c in _context.EDMSFiles.Where(x => !x.IsDeleted && (x.IsFileMaster == null || x.IsFileMaster == true)) on a.FileCode equals c.FileCode
                                   join b in _context.EDMSRepoCatFiles on a.FileCode equals b.FileCode
                                   where ((fromDate == null) || (c.CreatedTime.HasValue && c.CreatedTime.Value.Date >= fromDate))
                                   && ((toDate == null) || (c.CreatedTime.HasValue && c.CreatedTime.Value.Date <= toDate))
                                   && (string.IsNullOrEmpty(jTablePara.Name) || (!string.IsNullOrEmpty(c.FileName) && c.FileName.ToLower().Contains(jTablePara.Name.ToLower())))
                                   && (string.IsNullOrEmpty(jTablePara.Tags) || (!string.IsNullOrEmpty(c.Tags) && c.Tags.ToLower().Contains(jTablePara.Tags.ToLower())))
                                   && (listType.Length == 0 || (listType.Any(x => x.ToLower() == c.FileTypePhysic.ToLower())))
                                     && (string.IsNullOrEmpty(jTablePara.ObjectType) || (jTablePara.ObjectType == EnumHelper<All>.GetDisplayValue(All.All)) || b.ObjectType == jTablePara.ObjectType)
                     && (string.IsNullOrEmpty(jTablePara.ObjectCode) || b.ObjectCode == jTablePara.ObjectCode)
                                   && (string.IsNullOrEmpty(jTablePara.UserUpload) || (c.CreatedBy == jTablePara.UserUpload))
                                   select a).Count();
                var jdata = JTableHelper.JObjectTable(paggingLucene, jTablePara.Draw, countLucene, "FileID", "FileName", "FileTypePhysic", 
                    "CreatedBy", "CreatedTime", "Tags", "Url", "Content", "MimeType", "Id", "ReposName", "CloudFileId", "ServerAddress",
                    "Category", "FolderName", "FileSize", "SizeOfFile", "CatName");
                return Json(jdata);
            }
            else
            {
                if (!jTablePara.RecentFile)
                {
                    var query2 = (from a in _context.EDMSFiles.Where(x => !x.IsDeleted && (x.IsFileMaster == null || x.IsFileMaster == true))
                                  join b in _context.EDMSRepoCatFiles on a.FileCode equals b.FileCode
                                  join d in _context.EDMSRepositorys on a.ReposCode equals d.ReposCode into d2
                                  from d in d2.DefaultIfEmpty()
                                  join e in _context.EDMSCategorys.Where(x => !x.IsDeleted) on b.CatCode equals e.CatCode into e1
                                  from e in e1.DefaultIfEmpty()
                                  where ((fromDate == null) || (a.CreatedTime.HasValue && a.CreatedTime.Value.Date >= fromDate))
                                      && (string.IsNullOrEmpty(jTablePara.UserUpload) || (a.CreatedBy == jTablePara.UserUpload))
                                      && ((toDate == null) || (a.CreatedTime.HasValue && a.CreatedTime.Value.Date <= toDate))
                                      && (string.IsNullOrEmpty(jTablePara.Name) || a.FileName.ToLower().Contains(jTablePara.Name.ToLower()))
                                      && (string.IsNullOrEmpty(jTablePara.Tags) || a.Tags.ToLower().Contains(jTablePara.Tags.ToLower()))
                                      && (listType.Length == 0 || (listType.Any(x => x == a.FileTypePhysic)))
                                      && (jTablePara.ListRepository.Length != 0 && (jTablePara.ListRepository.Any(x => x == b.CatCode)))
                                      && (string.IsNullOrEmpty(jTablePara.ObjectType) || (jTablePara.ObjectType == EnumHelper<All>.GetDisplayValue(All.All)) || b.ObjectType == jTablePara.ObjectType)
                                      && (string.IsNullOrEmpty(jTablePara.ObjectCode) || b.ObjectCode == jTablePara.ObjectCode)
                                  select new { a, b, d, e });
                    var capacity = query2.Sum(x => x.a.FileSize.Value);
                    var query = query2.OrderByDescending(x => x.a.FileID).AsNoTracking().Skip(intBeginFor).Take(jTablePara.Length).ToList();


                    var count = (from a in _context.EDMSFiles.Where(x => !x.IsDeleted && (x.IsFileMaster == null || x.IsFileMaster == true))
                                 join b in _context.EDMSRepoCatFiles on a.FileCode equals b.FileCode
                                 where ((fromDate == null) || (a.CreatedTime.HasValue && a.CreatedTime.Value.Date >= fromDate))
                                     && (string.IsNullOrEmpty(jTablePara.UserUpload) || (a.CreatedBy == jTablePara.UserUpload))
                                     && ((toDate == null) || (a.CreatedTime.HasValue && a.CreatedTime.Value.Date <= toDate))
                                     && (string.IsNullOrEmpty(jTablePara.Name) || a.FileName.ToLower().Contains(jTablePara.Name.ToLower()))
                                     && (string.IsNullOrEmpty(jTablePara.Tags) || a.Tags.ToLower().Contains(jTablePara.Tags.ToLower()))
                                     && (listType.Length == 0 || (listType.Any(x => x == a.FileTypePhysic)))
                                     && (jTablePara.ListRepository.Length != 0 && (jTablePara.ListRepository.Any(x => x == b.CatCode)))
                                     && (string.IsNullOrEmpty(jTablePara.ObjectType) || (jTablePara.ObjectType == EnumHelper<All>.GetDisplayValue(All.All)) || b.ObjectType == jTablePara.ObjectType)
                                     && (string.IsNullOrEmpty(jTablePara.ObjectCode) || b.ObjectCode == jTablePara.ObjectCode)
                                 select a).AsNoTracking().Count();
                    var list = query.Select(x => new
                    {
                        Id = x.b != null ? x.b.Id : -1,
                        x.a.FileID,
                        x.a.FileName,
                        x.a.FileTypePhysic,
                        x.a.CreatedBy,
                        x.a.CreatedTime,
                        x.a.Tags,
                        x.a.Url,
                        x.a.MimeType,
                        ReposName = x.d != null ? x.d.ReposName : "",
                        x.a.CloudFileId,
                        ServerAddress = x.d != null ? x.d.Server : "",
                        Category = x.b != null ? x.b.CatCode : "",
                        FileSize = capacity,
                        SizeOfFile = x.a.FileSize.HasValue ? x.a.FileSize.Value : 0,
                        //CatName = x.e != null ? x.e.CatName : "",
                        CatName = GetFullPathCategory(x.b.CatCode, "", new List<string>(), false, ""),
                        UpdateTime = x.a.EditedFileTime.HasValue ? x.a.EditedFileTime.Value.ToString("dd/MM/yyyy HH:mm:ss") : ""
                    }).ToList();
                    var jdata = JTableHelper.JObjectTable(list, jTablePara.Draw, count, "FileID", "FileName", "FileTypePhysic", "CreatedBy",
                        "CreatedTime", "Tags", "Url", "MimeType", "Id", "ReposName", "CloudFileId", "ServerAddress", "Category", "FolderName",
                        "FileSize", "SizeOfFile", "CatName", "UpdateTime");
                    return Json(jdata);
                }
                else
                {
                    var query2 = (from a in _context.EDMSFiles.Where(x => !x.IsDeleted && (x.IsFileMaster == null || x.IsFileMaster == true))
                                  join b in _context.EDMSRepoCatFiles on a.FileCode equals b.FileCode
                                  join d in _context.EDMSRepositorys on a.ReposCode equals d.ReposCode into d2
                                  from d in d2.DefaultIfEmpty()
                                  join e in _context.EDMSCategorys.Where(x => !x.IsDeleted) on b.CatCode equals e.CatCode into e1
                                  from e in e1.DefaultIfEmpty()
                                  where ((fromDate == null) || (a.CreatedTime.HasValue && a.CreatedTime.Value.Date >= fromDate))
                                      && (string.IsNullOrEmpty(jTablePara.UserUpload) || (a.CreatedBy == jTablePara.UserUpload))
                                      && ((toDate == null) || (a.CreatedTime.HasValue && a.CreatedTime.Value.Date <= toDate))
                                      && (string.IsNullOrEmpty(jTablePara.Name) || a.FileName.ToLower().Contains(jTablePara.Name.ToLower()))
                                      && (string.IsNullOrEmpty(jTablePara.Tags) || a.Tags.ToLower().Contains(jTablePara.Tags.ToLower()))
                                      && (listType.Length == 0 || (listType.Any(x => x == a.FileTypePhysic)))
                                      && ((jTablePara.ListRepository.Length == 0 && a.EditedFileTime >= DateTime.Now.AddDays(-3)) || (jTablePara.ListRepository.Any(x => x == b.CatCode) && a.EditedFileTime >= DateTime.Now.AddDays(-3)))
                                      //&& (jTablePara.ListRepository.Length != 0 && (jTablePara.ListRepository.Any(x => x == b.CatCode)))
                                      && (string.IsNullOrEmpty(jTablePara.ObjectType) || (jTablePara.ObjectType == EnumHelper<All>.GetDisplayValue(All.All)) || b.ObjectType == jTablePara.ObjectType)
                                      && (string.IsNullOrEmpty(jTablePara.ObjectCode) || b.ObjectCode == jTablePara.ObjectCode)
                                  select new { a, b, d, e });
                    var capacity = query2.Sum(x => x.a.FileSize.Value);
                    var query = query2.OrderByDescending(x => x.a.FileID).AsNoTracking().Skip(intBeginFor).Take(jTablePara.Length).ToList();
                    var count = (from a in _context.EDMSFiles.Where(x => !x.IsDeleted && (x.IsFileMaster == null || x.IsFileMaster == true))
                                 join b in _context.EDMSRepoCatFiles on a.FileCode equals b.FileCode
                                 where ((fromDate == null) || (a.CreatedTime.HasValue && a.CreatedTime.Value.Date >= fromDate))
                                     && (string.IsNullOrEmpty(jTablePara.UserUpload) || (a.CreatedBy == jTablePara.UserUpload))
                                     && ((toDate == null) || (a.CreatedTime.HasValue && a.CreatedTime.Value.Date <= toDate))
                                     && (string.IsNullOrEmpty(jTablePara.Name) || a.FileName.ToLower().Contains(jTablePara.Name.ToLower()))
                                     && (string.IsNullOrEmpty(jTablePara.Tags) || a.Tags.ToLower().Contains(jTablePara.Tags.ToLower()))
                                     && (listType.Length == 0 || (listType.Any(x => x == a.FileTypePhysic)))
                                     && ((jTablePara.ListRepository.Length == 0 && a.EditedFileTime >= DateTime.Now.AddDays(-3)) || (jTablePara.ListRepository.Any(x => x == b.CatCode)))
                                     //&& (jTablePara.ListRepository.Length != 0 && (jTablePara.ListRepository.Any(x => x == b.CatCode)))
                                     && (string.IsNullOrEmpty(jTablePara.ObjectType) || (jTablePara.ObjectType == EnumHelper<All>.GetDisplayValue(All.All)) || b.ObjectType == jTablePara.ObjectType)
                                     && (string.IsNullOrEmpty(jTablePara.ObjectCode) || b.ObjectCode == jTablePara.ObjectCode)
                                 select a).AsNoTracking().Count();
                    var list = query.Select(x => new
                    {
                        Id = x.b != null ? x.b.Id : -1,
                        x.a.FileID,
                        x.a.FileName,
                        x.a.FileTypePhysic,
                        x.a.CreatedBy,
                        x.a.CreatedTime,
                        x.a.Tags,
                        x.a.Url,
                        x.a.MimeType,
                        ReposName = x.d != null ? x.d.ReposName : "",
                        x.a.CloudFileId,
                        ServerAddress = x.d != null ? x.d.Server : "",
                        Category = x.b != null ? x.b.CatCode : "",
                        FileSize = capacity,
                        SizeOfFile = x.a.FileSize.HasValue ? x.a.FileSize.Value : 0,
                        CatName = x.e != null ? x.e.CatName : "",
                        UpdateTime = x.a.EditedFileTime.HasValue ? x.a.EditedFileTime.Value.ToString("dd/MM/yyyy HH:mm:ss") : ""
                    }).ToList();
                    var jdata = JTableHelper.JObjectTable(list, jTablePara.Draw, count, "FileID", "FileName", "FileTypePhysic", "CreatedBy",
                        "CreatedTime", "Tags", "Url", "MimeType", "Id", "ReposName", "CloudFileId", "ServerAddress", "Category", "FolderName",
                        "FileSize", "SizeOfFile", "CatName", "UpdateTime");
                    return Json(jdata);
                }
            }
        }
        [NonAction]
        public string GetFullPathCategory(string catCode, string path, List<string> list, bool check, string realPath)
        {
            var category = _context.EDMSCategorys.FirstOrDefault(x => !x.IsDeleted && x.CatCode == catCode);
            if(category != null)
            {
                list.Add(category.CatCode);
                if (!string.IsNullOrEmpty(category.CatParent) && category.CatParent != "#")
                {
                    foreach(var item in list)
                    {
                        if (item == category.CatParent)
                            check = true;
                    }

                    if(!check)
                    {
                        GetFullPathCategory(category.CatParent, path, list, check, "");
                        foreach (var item in list)
                        {
                            var cat = _context.EDMSCategorys.FirstOrDefault(x => !x.IsDeleted && x.CatCode == item);
                            realPath = cat.CatName + "/" + realPath;
                        }
                    }
                }
                else
                {
                    foreach (var item in list)
                    {
                        var cat = _context.EDMSCategorys.FirstOrDefault(x => !x.IsDeleted && x.CatCode == item);
                        realPath = cat.CatName + "/" + realPath;
                    }
                }
            }
            return realPath;
        }



        [HttpPost]
        public object JTableFileHistory([FromBody]JTableModelFile jTablePara)
        {
            if (jTablePara.FileID == null)
            {
                return JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "Id", "FileName", "FileTypePhysic", "Desc", "Url", "CreatedTime", "UpdatedTime", "ReposName", "TypeFile", "IsFileMaster", "EditedFileBy", "EditedFileTime", "FileID");
            }
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var query = (from a in _context.EDMSRepoCatFiles
                         join b in _context.EDMSFiles.Where(x => !x.IsDeleted && x.FileParentId.Equals(jTablePara.FileID) && (x.IsFileMaster == null || x.IsFileMaster == false)) on a.FileCode equals b.FileCode
                         join f in _context.EDMSRepositorys on a.ReposCode equals f.ReposCode into f1
                         from f in f1.DefaultIfEmpty()
                         select new
                         {
                             a.Id,
                             b.FileCode,
                             b.FileName,
                             b.FileTypePhysic,
                             b.Desc,
                             b.CreatedTime,
                             b.CloudFileId,
                             TypeFile = "NO_SHARE",
                             ReposName = f != null ? f.ReposName : "",
                             b.IsFileMaster,
                             EditedFileBy = _context.Users.FirstOrDefault(x => x.UserName.Equals(b.EditedFileBy)) != null ? _context.Users.FirstOrDefault(x => x.UserName.Equals(b.EditedFileBy)).GivenName : "",
                             b.EditedFileTime,
                         }).AsNoTracking();
            int count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "FileCode", "FileName", "FileTypePhysic", "Desc", "CreatedTime", "CloudFileId", "ReposName", "TypeFile", "IsFileMaster", "EditedFileBy", "EditedFileTime");
            return jdata;
        }

        [HttpPost]
        [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
        [RequestSizeLimit(long.MaxValue)]
        public JsonResult InsertFile(EDMSRepoCatFileModel obj, IFormFile fileUpload)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var mimeType = fileUpload.ContentType;
                string extension = Path.GetExtension(fileUpload.FileName);
                string urlFile = "";
                string fileId = "";
                var fileSize = fileUpload.Length;
                if ((fileSize / 1048576.0) > 1000)
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["EDMSR_MSG_FILE_SIZE_LIMIT_UPLOAD"];
                    return Json(msg);
                }

                if (Array.IndexOf(LuceneExtension.fileMimetypes, mimeType) >= 0 && (Array.IndexOf(LuceneExtension.fileExt, extension.ToUpper()) >= 0))
                {
                    string reposCode = "";
                    string catCode = "";
                    string path = "";
                    string folderId = "";

                    var setting = _context.EDMSCatRepoSettings.FirstOrDefault(x => x.Id == obj.CateRepoSettingId);
                    if (setting != null)
                    {
                        reposCode = setting.ReposCode;
                        path = setting.Path;
                        folderId = setting.FolderId;
                        catCode = setting.CatCode;
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["EDMSR_MSG_CHOOSE_DOC_SAVE"];
                        return Json(msg);
                    }

                    var getRepository = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == reposCode);
                    if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server))
                    {
                        using (var ms = new MemoryStream())
                        {
                            fileUpload.CopyTo(ms);
                            var fileBytes = ms.ToArray();
                            urlFile = path + Path.Combine("/", fileUpload.FileName);
                            var urlFilePreventive = path + Path.Combine("/", Guid.NewGuid().ToString().Substring(0, 8) + fileUpload.FileName);
                            var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + getRepository.Server + urlFile);
                            var urlEndPreventive = System.Web.HttpUtility.UrlPathEncode("ftp://" + getRepository.Server + urlFilePreventive);
                            var result = FileExtensions.UploadFileToFtpServer(urlEnd, urlEndPreventive, fileBytes, getRepository.Account, getRepository.PassWord);
                            if (result.Status == WebExceptionStatus.ConnectFailure || result.Status == WebExceptionStatus.ProtocolError)
                            {
                                msg.Error = true;
                                msg.Title = _sharedResources["COM_CONNECT_FAILURE"];
                                return Json(msg);
                            }
                            else if (result.Status == WebExceptionStatus.Success)
                            {
                                if (result.IsSaveUrlPreventive)
                                {
                                    urlFile = urlFilePreventive;
                                }
                            }
                            else
                            {
                                msg.Error = true;
                                msg.Title = _sharedResources["COM_MSG_ERR"];
                                return Json(msg);
                            }
                        }
                    }
                    else if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.GooglerDriver))
                    {
                        fileId = FileExtensions.UploadFileToDrive(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", fileUpload.FileName, fileUpload.OpenReadStream(), fileUpload.ContentType, folderId);
                    }
                    var edmsReposCatFile = new EDMSRepoCatFile
                    {
                        FileCode = string.Concat("REPOSITORY", Guid.NewGuid().ToString()),
                        ReposCode = reposCode,
                        CatCode = catCode,
                        ObjectCode = null,
                        ObjectType = null,
                        Path = path,
                        FolderId = folderId
                    };
                    _context.EDMSRepoCatFiles.Add(edmsReposCatFile);

                    /// created Index lucene
                    if (!extension.ToUpper().Equals(".ZIP") && !extension.ToUpper().Equals(".RAR"))
                    {
                        LuceneExtension.IndexFile(edmsReposCatFile.FileCode, fileUpload, string.Concat(_hostingEnvironment.WebRootPath, "\\uploads\\luceneIndex"));
                    }
                    //add File
                    var file = new EDMSFile
                    {
                        FileCode = edmsReposCatFile.FileCode,
                        FileName = fileUpload.FileName,
                        Desc = obj.Desc,
                        ReposCode = reposCode,
                        Tags = obj.Tags,
                        FileSize = fileUpload.Length,
                        FileTypePhysic = Path.GetExtension(fileUpload.FileName),
                        NumberDocument = obj.NumberDocument,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now,
                        Url = urlFile,
                        MimeType = mimeType,
                        CloudFileId = fileId,
                    };
                    _context.EDMSFiles.Add(file);

                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_ADD_FILE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_MSG_INVALID_FORMAT"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult DeleteFile([FromBody]int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.EDMSRepoCatFiles.FirstOrDefault(x => x.Id == id);
                _context.EDMSRepoCatFiles.Remove(data);

                var file = _context.EDMSFiles.FirstOrDefault(x => x.FileCode == data.FileCode);
                _context.EDMSFiles.Remove(file);

                LuceneExtension.DeleteIndexFile(file.FileCode, _hostingEnvironment.WebRootPath + "\\uploads\\luceneIndex");
                var getRepository = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == data.ReposCode);
                if (getRepository != null)
                {
                    if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server))
                    {
                        var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + getRepository.Server + file.Url);
                        FileExtensions.DeleteFileFtpServer(urlEnd, getRepository.Account, getRepository.PassWord);
                    }
                    else if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.GooglerDriver))
                    {
                        FileExtensions.DeleteFileGoogleServer(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", file.CloudFileId);
                    }
                }
                _context.SaveChanges();
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer[""]);// "Xóa thành công";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = _sharedResources["COM_MSG_ERR"];//"Xóa file lỗi";
            }
            return Json(msg);
        }

        [HttpGet]
        public IActionResult DownloadFile(string fileCode)
        {
            var obj = _context.EDMSRepoCatFiles.FirstOrDefault(x => x.FileCode == fileCode);
            var file = _context.EDMSFiles.FirstOrDefault(x => x.FileCode == fileCode && !x.IsDeleted);
            if (obj != null)
            {
                var repository = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == obj.ReposCode);
                if (repository != null)
                {
                    if (repository.Type == "SERVER")
                    {
                        string ftphost = repository.Server;
                        string ftpfilepath = file.Url;
                        var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + ftphost + ftpfilepath);
                        using (WebClient request = new WebClient())
                        {
                            request.Credentials = new NetworkCredential(repository.Account, repository.PassWord);
                            byte[] fileData = request.DownloadData(urlEnd);
                            return File(fileData, file.MimeType, string.Concat(file.FileName, file.FileTypePhysic));
                        }
                    }
                    else
                    {
                        var fileData = FileExtensions.DowloadFileGoogle(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", file.CloudFileId);
                        return File(fileData, file.MimeType, string.Concat(file.FileName, file.FileTypePhysic));
                    }
                }
                else
                {
                    return null;
                }
            }
            else
            {
                return null;
            }
        }

        [HttpPost]
        public JsonResult CreateTempFile(int Id, bool isSearch, string content)
        {
            JMessage msg = new JMessage() { Error = false };
            var data = (from a in _context.EDMSRepoCatFiles.Where(x => x.Id == Id)
                        join b in _context.EDMSRepositorys on a.ReposCode equals b.ReposCode into b2
                        from b in b2.DefaultIfEmpty()
                        join c in _context.EDMSFiles on a.FileCode equals c.FileCode into c2
                        from c in c2.DefaultIfEmpty()
                        select new
                        {
                            a.Id,
                            Server = (b != null ? b.Server : null),
                            Type = (b != null ? b.Type : null),
                            Url = (c != null ? c.Url : null),
                            FileId = (c != null ? c.CloudFileId : null),
                            FileTypePhysic = c.FileTypePhysic,
                            c.FileName,
                            c.MimeType,
                            b.Account,
                            b.PassWord,
                            c.FileCode
                        }
                        ).FirstOrDefault();
            if (data != null)
            {
                var fileTempName = "File_temp" + Path.GetExtension(data.FileName);

                if (!string.IsNullOrEmpty(data.Server))
                {
                    string ftphost = data.Server;
                    string ftpfilepath = data.Url;
                    var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + ftphost + ftpfilepath);
                    using (WebClient request = new WebClient())
                    {
                        request.Credentials = new NetworkCredential(data.Account, data.PassWord);
                        byte[] fileData = request.DownloadData(urlEnd);
                        JMessage msg1 = _upload.UploadFileByBytes(fileData, fileTempName, _hostingEnvironment.WebRootPath, "uploads\\tempFile");
                        string path = msg1.Object.ToString();
                        //if (Array.IndexOf(excel, data.FileTypePhysic.ToUpper()) >= 0 || Array.IndexOf(word, data.FileTypePhysic.ToUpper()) >= 0)
                        //    path = ConvertToPdf(path, data.FileTypePhysic);
                        if (isSearch)
                        {
                            List<string> arr = new List<string>();
                            arr.Add(content);
                            if (Array.IndexOf(word, data.FileTypePhysic.ToUpper()) >= 0)
                            {
                                UpdateFileWord(path, arr, data.FileTypePhysic);
                            }
                            else if (Array.IndexOf(excel, data.FileTypePhysic.ToUpper()) >= 0)
                            {
                                UpdateFileExcel(path, arr, data.FileTypePhysic.ToUpper());
                            }
                            else if (Array.IndexOf(pdf, data.FileTypePhysic.ToUpper()) >= 0)
                            {
                                UpdateFilePdf(path, arr, data.FileTypePhysic.ToUpper());
                            }
                        }

                        msg1.Object = path.Replace("\\", "/");
                        return Json(msg1);
                    }
                }
                else
                {
                    byte[] fileData = FileExtensions.DowloadFileGoogle(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", data.FileId);
                    JMessage msg1 = _upload.UploadFileByBytes(fileData, fileTempName, _hostingEnvironment.WebRootPath, "uploads\\tempFile");
                    string path = msg1.Object.ToString();
                    if (isSearch)
                    {
                        List<string> arr = new List<string>();
                        arr.Add(content);
                        if (Array.IndexOf(word, data.FileTypePhysic.ToUpper()) >= 0)
                        {
                            UpdateFileWord(path, arr, data.FileTypePhysic);
                        }
                        else if (Array.IndexOf(excel, data.FileTypePhysic.ToUpper()) >= 0)
                        {
                            UpdateFileExcel(path, arr, data.FileTypePhysic.ToUpper());
                        }
                        else if (Array.IndexOf(pdf, data.FileTypePhysic.ToUpper()) >= 0)
                        {
                            UpdateFilePdf(path, arr, data.FileTypePhysic.ToUpper());
                        }
                    }

                    msg1.Object = path.Replace("\\", "/");
                    return Json(msg1);
                }
            }
            return Json(msg);
        }

        [NonAction]
        private string ConvertToPdf(string pathFile, string type)
        {
            if (Array.IndexOf(excel, type.ToUpper()) >= 0)
                return ConvertExcelToPdf(pathFile);
            else if (Array.IndexOf(word, type.ToUpper()) >= 0)
                return ConvertWordToPdf(pathFile);
            return null;
        }

        [NonAction]
        private string ConvertExcelToPdf(string pathFile)
        {
            var path = Path.Combine(_hostingEnvironment.WebRootPath, pathFile);
            //using (ExcelEngine excelEngine = new ExcelEngine())
            //{
            //    IApplication application = excelEngine.Excel;
            //    FileStream excelStream = new FileStream(path, FileMode.Open, FileAccess.Read);
            //    IWorkbook workbook = application.Workbooks.Open(excelStream);
            //    //Initialize XlsIO renderer.
            //    XlsIORenderer renderer = new XlsIORenderer();
            //    //Convert Excel document into PDF document 
            //    PdfDocument pdfDocument = renderer.ConvertToPDF(workbook);
            //    Stream stream = new FileStream(path + ".pdf", FileMode.Create, FileAccess.ReadWrite);
            //    pdfDocument.Save(stream);
            //    excelStream.Dispose();
            //    stream.Dispose();
            //}
            return pathFile + ".pdf";
        }

        [NonAction]
        private string ConvertWordToPdf(string pathFile)
        {
            try
            {
                //var path = Path.Combine(_hostingEnvironment.WebRootPath, pathFile);
                //FileStream docStream = new FileStream(path, FileMode.Open, FileAccess.Read);
                //WordDocument wordDocument = new WordDocument(docStream, Syncfusion.DocIO.FormatType.Automatic);
                //DocIORenderer render = new DocIORenderer();
                //render.Settings.ChartRenderingOptions.ImageFormat = Syncfusion.OfficeChart.ExportImageFormat.Jpeg;
                //PdfDocument pdfDocument = render.ConvertToPDF(wordDocument);
                //render.Dispose();
                //wordDocument.Dispose();
                ////Saves the PDF file
                //FileStream pdfStream = new FileStream(path + ".pdf", FileMode.Create, FileAccess.Write);
                ////MemoryStream outputStream = new MemoryStream();
                //pdfDocument.Save(pdfStream);
                //pdfStream.Close();
                //docStream.Close();
                //pdfDocument.Close();
                return pathFile + ".pdf";
            }

            catch (Exception ex)
            {
                throw ex;
            }
        }

        [NonAction]
        private void UpdateFileWord(string pathFile, List<string> words, string type)
        {
            FileStream fileStream = null;
            Syncfusion.DocIO.DLS.WordDocument document = null;
            try
            {
                var path = Path.Combine(_hostingEnvironment.WebRootPath, pathFile);
                fileStream = new FileStream(path, FileMode.Open, FileAccess.ReadWrite);
                document = new Syncfusion.DocIO.DLS.WordDocument(fileStream, Syncfusion.DocIO.FormatType.Automatic);
                foreach (var item in words)
                {
                    Syncfusion.DocIO.DLS.TextSelection[] textSelections = document.FindAll(item, false, true);
                    foreach (Syncfusion.DocIO.DLS.TextSelection textSelection in textSelections)
                    {
                        Syncfusion.DocIO.DLS.WTextRange textRange = textSelection.GetAsOneRange();
                        textRange.CharacterFormat.HighlightColor = Syncfusion.Drawing.Color.Yellow;
                    }
                }
                if (type.ToLower().Contains(".docx"))
                    document.Save(fileStream, FormatType.Docx);
                else
                    document.Save(fileStream, FormatType.Doc);
                fileStream.Flush();
                fileStream.Close();
                document.Close();
            }
            catch (Exception ex)
            {
                if (fileStream != null)
                    fileStream.Close();
                if (document != null)
                {
                    document.Close();
                }
            }
        }

        [NonAction]
        private void UpdateFilePdf1(string pathFile, List<string> words, string type)
        {

        }

        [NonAction]
        private void UpdateFilePdf(string pathFile, List<string> words, string type)
        {

            var path = Path.Combine(_hostingEnvironment.WebRootPath, pathFile);
            var document = new Document(path);
            var pages = document.Pages;
            for (var i = 1; i <= pages.Count(); ++i)
            {
                try
                {
                    var item = pages[i];
                    var tfa = new TextFragmentAbsorber(words[0], new Aspose.Pdf.Text.TextSearchOptions(false));
                    tfa.Visit(item);

                    foreach (var textFragment in tfa.TextFragments)
                    {

                        var highlightAnnotation = HighLightTextFragment(item, textFragment);
                        item.Annotations.Add(highlightAnnotation);

                    }
                }
                catch (Exception ex)
                {

                }

            }
            //foreach (var item in pages)
            //{
            //    try
            //    {
            //        var tfa = new TextFragmentAbsorber(words[0], new Aspose.Pdf.Text.TextSearchOptions(false));
            //        tfa.Visit(item);

            //        foreach (var textFragment in tfa.TextFragments)
            //        {

            //            var highlightAnnotation = HighLightTextFragment(item, textFragment);
            //            item.Annotations.Add(highlightAnnotation);

            //        }
            //    }
            //    catch (Exception ex)
            //    {

            //    }
            //}
            document.Save(path);
        }

        [NonAction]
        private void UpdateFileExcel(string pathFile, List<string> words, string type)
        {
            var path = Path.Combine(_hostingEnvironment.WebRootPath, pathFile);
            using (ExcelEngine excelEngine = new ExcelEngine())
            {
                IApplication application = excelEngine.Excel;
                FileStream fileStream = new FileStream(path, FileMode.Open, FileAccess.ReadWrite);
                IWorkbook workbook = application.Workbooks.Open(fileStream);
                Syncfusion.XlsIO.IStyle tableHeader = workbook.Styles.Add("" + DateTime.Now.Ticks);
                tableHeader.Font.Color = ExcelKnownColors.Black;
                tableHeader.Font.Bold = true;
                //tableHeader.Font.Size = 11;
                //tableHeader.Font.FontName = "Calibri";
                //tableHeader.HorizontalAlignment = ExcelHAlign.HAlignCenter;
                //tableHeader.VerticalAlignment = ExcelVAlign.VAlignCenter;
                tableHeader.Color = Syncfusion.Drawing.Color.Yellow;
                //tableHeader.Borders[ExcelBordersIndex.EdgeLeft].LineStyle = ExcelLineStyle.None;
                //tableHeader.Borders[ExcelBordersIndex.EdgeRight].LineStyle = ExcelLineStyle.None;
                //tableHeader.Borders[ExcelBordersIndex.EdgeTop].LineStyle = ExcelLineStyle.None;
                //tableHeader.Borders[ExcelBordersIndex.EdgeBottom].LineStyle = ExcelLineStyle.None;
                //tableHeader.Borders[ExcelBordersIndex.EdgeBottom].LineStyle = ExcelLineStyle.None;

                try
                {
                    foreach (var worksheet in workbook.Worksheets)
                    {
                        IRange[] result1 = worksheet.FindAll(words[0], ExcelFindType.Text);
                        if (result1 != null && result1.Length > 0)
                            foreach (var item in result1)
                            {
                                try
                                {
                                    if (item.DisplayText.ToLower() == words[0].ToLower())
                                    {
                                        Syncfusion.XlsIO.IStyle style = item.CellStyle;
                                        if (style == null)
                                        {
                                            style = tableHeader;
                                        }
                                        else
                                        {
                                            style.Font.Color = ExcelKnownColors.Black;
                                            style.Color = Syncfusion.Drawing.Color.Yellow;
                                        }
                                        worksheet.Range[item.AddressLocal].CellStyle = style;
                                    }
                                }
                                catch (Exception exex)
                                {
                                    var bug = "";
                                }
                            }
                    }
                    fileStream.Close();
                    fileStream = null;
                    fileStream = new FileStream(path, FileMode.Open, FileAccess.ReadWrite);
                    workbook.SaveAs(fileStream);
                    fileStream.Dispose();
                    workbook.Close();
                }
                catch (Exception ex)
                {
                    fileStream.Close();
                    workbook.Close();
                    throw ex;
                }
            }
        }

        [NonAction]
        private HighlightAnnotation HighLightTextFragment(Page page, TextFragment textFragment)
        {
            if (textFragment.Segments.Count == 1)
                return new HighlightAnnotation(page, textFragment.Segments[1].Rectangle);

            var offset = 0;
            var quadPoints = new Aspose.Pdf.Point[textFragment.Segments.Count * 4];
            foreach (var segment in textFragment.Segments)
            {
                quadPoints[offset + 0] = new Aspose.Pdf.Point(segment.Rectangle.LLX, segment.Rectangle.URY);
                quadPoints[offset + 1] = new Aspose.Pdf.Point(segment.Rectangle.URX, segment.Rectangle.URY);
                quadPoints[offset + 2] = new Aspose.Pdf.Point(segment.Rectangle.LLX, segment.Rectangle.LLY);
                quadPoints[offset + 3] = new Aspose.Pdf.Point(segment.Rectangle.URX, segment.Rectangle.LLY);
                offset += 4;
            }

            var llx = quadPoints.Min(pt => pt.X);
            var lly = quadPoints.Min(pt => pt.Y);
            var urx = quadPoints.Max(pt => pt.X);
            var ury = quadPoints.Max(pt => pt.Y);
            return new HighlightAnnotation(page, new Aspose.Pdf.Rectangle(llx, lly, urx, ury))
            {
                Modified = DateTime.Now,
                QuadPoints = quadPoints
            };
        }

        [HttpPost]
        public JsonResult GetSupportCategory(string CatCode)
        {
            JMessage msg = new JMessage() { Error = false };
            try
            {
                var data = _context.EDMSRepoCatFiles.Where(x => x.ObjectCode == null && x.ObjectType == null && x.CatCode == CatCode).MaxBy(x => x.Id);
                if (data != null)
                {
                    var dt = _context.EDMSCatRepoSettings.FirstOrDefault(x => x.Path == data.Path && x.ReposCode == data.ReposCode && x.CatCode == CatCode);
                    msg.Object = dt;
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }

            return Json(msg);
        }

        [HttpPost]
        public object GetItem(int Id)
        {
            var data = (from a in _context.EDMSRepoCatFiles.Where(x => x.Id == Id)
                        join b in _context.EDMSRepositorys on a.ReposCode equals b.ReposCode into b2
                        from b in b2.DefaultIfEmpty()
                        join c in _context.EDMSFiles on a.FileCode equals c.FileCode into c2
                        from c in c2.DefaultIfEmpty()
                        select new
                        {
                            a.Id,
                            Server = (b != null ? b.Server : null),
                            Type = (b != null ? b.Type : null),
                            Url = (c != null ? c.Url : null),
                            FileId = (c != null ? c.CloudFileId : null),
                            FileTypePhysic = c.FileTypePhysic,
                            c.FileName,
                            c.MimeType,
                            b.Account,
                            b.PassWord,
                            c.FileCode,
                            c.IsEdit,
                            c.IsFileMaster,
                            c.FileParentId
                        }).FirstOrDefault();

            var aseanDoc = new AseanDocument();
            if (data != null)
            {
                if (!string.IsNullOrEmpty(data.Server))
                {
                    string ftphost = data.Server;
                    string ftpfilepath = data.Url;
                    var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + ftphost + ftpfilepath);
                    using (WebClient request = new WebClient())
                    {
                        request.Credentials = new NetworkCredential(data.Account, data.PassWord);
                        byte[] fileData = request.DownloadData(urlEnd);
                        JMessage msg1 = _upload.UploadFileByBytes(fileData, data.FileName, _hostingEnvironment.WebRootPath, "uploads\\tempFile");
                        string path = msg1.Object.ToString();
                        string pathConvert = "/" + path.Replace("\\", "/");
                        var extension = Path.GetExtension(path);
                        aseanDoc.File_Code = data.FileCode;
                        aseanDoc.File_Name = data.FileName;
                        aseanDoc.File_Type = data.FileTypePhysic;
                        aseanDoc.File_Path = path;
                        aseanDoc.FullPathView = ftpfilepath;
                        aseanDoc.IsEdit = data.IsEdit;
                        aseanDoc.IsFileMaster = data.IsFileMaster;
                        aseanDoc.FileParentId = data.FileParentId;

                        if (extension.Equals(".doc") || extension.Equals(".docx"))
                        {
                            DocmanController.docmodel = aseanDoc;
                        }
                        else if (extension.Equals(".xls") || extension.Equals(".xlsx"))
                        {
                            ExcelController.pathFileFTP = pathConvert;
                            ExcelController.docmodel = aseanDoc;
                        }
                        else if (extension.Equals(".pdf"))
                        {
                            PDFController.docmodel = aseanDoc;
                        }
                    }
                }
                else
                {
                    byte[] fileData = FileExtensions.DowloadFileGoogle(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", data.FileId);
                    JMessage msg1 = _upload.UploadFileByBytes(fileData, data.FileName, _hostingEnvironment.WebRootPath, "uploads\\tempFile");
                    string path = msg1.Object.ToString();
                    aseanDoc.File_Code = data.FileCode;
                    aseanDoc.File_Name = data.FileName;
                    aseanDoc.File_Type = data.FileTypePhysic;
                    aseanDoc.File_Path = path;
                    aseanDoc.IsEdit = data.IsEdit;
                    aseanDoc.IsFileMaster = data.IsFileMaster;
                    aseanDoc.FileParentId = data.FileParentId;
                    //DocmanController.docmodel = aseanDoc;
                    //ExcelController.docmodel = aseanDoc;
                    //PDFController.docmodel = aseanDoc;
                    var extension = Path.GetExtension(path);
                    if (extension.Equals(".doc") || extension.Equals(".docx"))
                    {
                        DocmanController.docmodel = aseanDoc;
                    }
                    else if (extension.Equals(".xls") || extension.Equals(".xlsx"))
                    {
                        ExcelController.docmodel = aseanDoc;
                    }
                    else if (extension.Equals(".pdf"))
                    {
                        PDFController.docmodel = aseanDoc;
                    }
                }
            }
            return aseanDoc;
        }

        [HttpGet]
        public object GetItemFile(int Id, bool? IsEdit, int mode)
        {
            //Kiểm tra trạng thái của file đang mở
            //TH1: Nếu đang ở trạng thái bị lock(IsEdit=false) thì thông báo cho người dùng là không được phép sửa file
            //TH2: Nếu trạng thái không bị lock(IsEdit=null hoặc IsEdit=true) thì cập nhật IsEdit=false và EditedFileTime, EditedFileBy
            var msg = new JMessage() { Error = false };
            try
            {
                var data = (from a in _context.EDMSRepoCatFiles.Where(x => x.Id == Id)
                            join b in _context.EDMSRepositorys on a.ReposCode equals b.ReposCode into b2
                            from b in b2.DefaultIfEmpty()
                            join c in _context.EDMSFiles on a.FileCode equals c.FileCode into c2
                            from c in c2.DefaultIfEmpty()
                            select new
                            {
                                a.Id,
                                Server = (b != null ? b.Server : null),
                                Type = (b != null ? b.Type : null),
                                Url = (c != null ? c.Url : null),
                                FileId = (c != null ? c.CloudFileId : null),
                                FileTypePhysic = c.FileTypePhysic,
                                c.FileName,
                                c.MimeType,
                                b.Account,
                                b.PassWord,
                                c.FileCode,
                                c.IsEdit,
                                c.IsFileMaster,
                                c.FileParentId,
                                c.FileID,
                                c.ListUserView
                            }).FirstOrDefault();

                var aseanDoc = new AseanDocument();
                if (data != null)
                {
                    var edmsFile = _context.EDMSFiles.FirstOrDefault(x => x.FileID.Equals(data.FileID));
                    var session = HttpContext.GetSessionUser();
                    var listUserEdit = new List<string>();
                    if (string.IsNullOrEmpty(data.ListUserView) && (data.IsFileMaster == true || data.IsFileMaster == null))
                    {
                        listUserEdit.Add(session.FullName);
                        edmsFile.ListUserView = JsonConvert.SerializeObject(listUserEdit);
                        edmsFile.EditedFileBy = User.Identity.Name;
                        edmsFile.EditedFileTime = DateTime.Now;
                        _context.EDMSFiles.Update(edmsFile);
                        _context.SaveChanges();
                    }
                    else if (!string.IsNullOrEmpty(data.ListUserView) && (data.IsFileMaster == true || data.IsFileMaster == null))
                    {
                        var check = JsonConvert.DeserializeObject<List<string>>(data.ListUserView);
                        msg.ID = -1;
                        msg.Error = true;
                        msg.Title = string.Format(_stringLocalizer["EDMSR_MSG_FILE_IS_EDITING_BY"], string.Join(",", check));
                        if (!check.Any(x => x.Equals(session.FullName)))
                        {
                            check.Add(session.FullName);
                            edmsFile.ListUserView = JsonConvert.SerializeObject(check);
                            edmsFile.EditedFileBy = User.Identity.Name;
                            edmsFile.EditedFileTime = DateTime.Now;
                            _context.EDMSFiles.Update(edmsFile);
                            _context.SaveChanges();
                        }
                    }

                    var fileTempName = "File_temp" + Path.GetExtension(data.FileName);

                    if (!string.IsNullOrEmpty(data.Server))
                    {
                        string ftphost = data.Server;
                        string ftpfilepath = data.Url;
                        var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + ftphost + ftpfilepath);
                        using (WebClient request = new WebClient())
                        {
                            request.Credentials = new NetworkCredential(data.Account, data.PassWord);
                            byte[] fileData = request.DownloadData(urlEnd);
                            JMessage msg1 = _upload.UploadFileByBytes(fileData, fileTempName, _hostingEnvironment.WebRootPath, "uploads\\tempFile");
                            string path = msg1.Object.ToString();
                            string pathConvert = "/" + path.Replace("\\", "/");
                            var extension = Path.GetExtension(path);
                            aseanDoc.File_Code = data.FileCode;
                            aseanDoc.File_Name = data.FileName;
                            aseanDoc.File_Type = data.FileTypePhysic;
                            aseanDoc.File_Path = path;
                            aseanDoc.FullPathView = ftpfilepath;
                            aseanDoc.IsEdit = data.IsEdit;
                            aseanDoc.IsFileMaster = data.IsFileMaster;
                            aseanDoc.FileParentId = data.FileParentId;
                            aseanDoc.Mode = mode;
                            aseanDoc.FirstPage = "/Admin/EDMSRepository";

                            if (extension.Equals(".doc") || extension.Equals(".docx"))
                            {
                                DocmanController.docmodel = aseanDoc;
                                DocmanController.pathFile = "";
                            }
                            else if (extension.Equals(".xls") || extension.Equals(".xlsx"))
                            {
                                ExcelController.pathFileFTP = pathConvert;
                                ExcelController.docmodel = aseanDoc;
                                ExcelController.fileCode = data.FileCode;
                                DocmanController.pathFile = "";
                            }
                            else if (extension.Equals(".pdf"))
                            {
                                PDFController.docmodel = aseanDoc;
                                DocmanController.pathFile = "";
                            }
                        }
                    }
                    else
                    {
                        byte[] fileData = FileExtensions.DowloadFileGoogle(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", data.FileId);
                        JMessage msg1 = _upload.UploadFileByBytes(fileData, fileTempName, _hostingEnvironment.WebRootPath, "uploads\\tempFile");
                        string path = msg1.Object.ToString();
                        aseanDoc.File_Code = data.FileCode;
                        aseanDoc.File_Name = data.FileName;
                        aseanDoc.File_Type = data.FileTypePhysic;
                        aseanDoc.File_Path = path;
                        aseanDoc.IsEdit = data.IsEdit;
                        aseanDoc.IsFileMaster = data.IsFileMaster;
                        aseanDoc.FileParentId = data.FileParentId;
                        aseanDoc.Mode = mode;
                        var extension = Path.GetExtension(path);

                        if (extension.Equals(".doc") || extension.Equals(".docx"))
                        {
                            DocmanController.docmodel = aseanDoc;
                        }
                        else if (extension.Equals(".xls") || extension.Equals(".xlsx"))
                        {
                            ExcelController.docmodel = aseanDoc;
                        }
                        else if (extension.Equals(".pdf"))
                        {
                            PDFController.docmodel = aseanDoc;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _stringLocalizer["EDMSR_MSG_FILE_NOT_EXIST"];
                return Json(msg);
            }

            return Json(msg);
        }

        [NonAction]
        private (IEnumerable<EDMSJtableFileModel> listLucene, int total) SearchLuceneFile(string content, int page, int length)
        {
            try
            {
                return LuceneExtension.SearchHighligh(content, _hostingEnvironment.WebRootPath + "\\uploads\\luceneIndex", page, length, "Content");
            }
            catch (Exception ex)
            {
                return (new List<EDMSJtableFileModel>(), 0);
            }
        }

        //[HttpPost]
        //public JsonResult GetAllContract()
        //{
        //    JMessage msg = new JMessage() { Error = false };
        //    try
        //    {
        //        var queryCus = from a in _context.PoSaleHeaders.Where(x => x.IsDeleted == false)
        //                       select new
        //                       {
        //                           Id = a.ContractHeaderID,
        //                           ContractCode = a.ContractCode,
        //                           Code = a.ContractCode,
        //                           Name = a.Title,
        //                           Type = "Customer",
        //                           a.CreatedTime
        //                       };
        //        //var querySup = from a in _context.PoBuyerHeaders.Where(x => x.IsDeleted == false)
        //        //               select new
        //        //               {
        //        //                   Id = a.Id,
        //        //                   ContractCode = a.PoSupCode,
        //        //                   Code = a.PoSupCode,
        //        //                   Name = a.PoSupCode,
        //        //                   Type = "Suppiler",
        //        //                   a.CreatedTime
        //        //               };
        //        //var list = queryCus.Union(querySup).OrderByDescending(x => x.CreatedTime).ToList();
        //        msg.Object = queryCus.ToList();
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Object = ex.Message;
        //        msg.Error = true;
        //        msg.Title = "Có lỗi khi lấy dữ liệu";
        //    }
        //    return Json(msg);
        //}

        //[HttpPost]
        //public JsonResult GetAllCustomer()
        //{
        //    JMessage msg = new JMessage() { Error = false };
        //    try
        //    {
        //        var queryCus = from a in _context.Customerss.Where(x => x.IsDeleted == false)
        //                       select new
        //                       {
        //                           Id = a.CusID,
        //                           CustomerCode = a.CusCode,
        //                           Code = a.CusCode,
        //                           Name = a.CusName
        //                       };
        //        var list = queryCus.OrderByDescending(x => x.Id).ToList();
        //        msg.Object = list;
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Object = ex.Message;
        //        msg.Error = true;
        //        msg.Title = "Có lỗi khi lấy dữ liệu";
        //    }
        //    return Json(msg);
        //}

        //[HttpPost]
        //public JsonResult GetAllSupplier()
        //{
        //    JMessage msg = new JMessage() { Error = false };
        //    try
        //    {
        //        var queryCus = from a in _context.Suppliers.Where(x => x.IsDeleted == false)
        //                       select new
        //                       {
        //                           Id = a.SupID,
        //                           SupplierCode = a.SupCode,
        //                           Code = a.SupCode,
        //                           Name = a.SupName
        //                       };
        //        var list = queryCus.OrderByDescending(x => x.Id).ToList();
        //        msg.Object = list;
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Object = ex.Message;
        //        msg.Error = true;
        //        msg.Title = "Có lỗi khi lấy dữ liệu";
        //    }
        //    return Json(msg);
        //}

        //[HttpPost]
        //public JsonResult GetAllProject()
        //{
        //    JMessage msg = new JMessage() { Error = false };
        //    try
        //    {
        //        var queryCus = from a in _context.Projects.Where(x => x.FlagDeleted == false)
        //                       select new
        //                       {
        //                           Id = a.Id,
        //                           ProjectCode = a.ProjectCode,
        //                           Code = a.ProjectCode,
        //                           Name = a.ProjectCode
        //                       };
        //        var list = queryCus.OrderByDescending(x => x.Id).ToList();
        //        msg.Object = list;
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Object = ex.Message;
        //        msg.Error = true;
        //        msg.Title = "Có lỗi khi lấy dữ liệu";
        //    }
        //    return Json(msg);
        //}
        [HttpGet]
        public object GetListObject(string objectType)
        {
            return (from a in _context.VAllObjects
                    where (string.IsNullOrEmpty(objectType) || (objectType == EnumHelper<All>.GetDisplayValue(All.All)) || a.ObjectType == objectType)
                    select a).AsNoTracking();
        }
        #endregion

        #region ui-select
        [HttpPost]
        public object GetObjectsType()
        {
            var list = new List<Properties>();
            var all = new Properties
            {
                Code = EnumHelper<All>.GetDisplayValue(All.All),
                Name = All.All.DescriptionAttr()
            };
            list.Add(all);

            var project = new Properties
            {
                Code = EnumHelper<ProjectEnum>.GetDisplayValue(ProjectEnum.Project),
                Name = ProjectEnum.Project.DescriptionAttr()
            };
            list.Add(project);

            var contract = new Properties
            {
                Code = EnumHelper<ContractEnum>.GetDisplayValue(ContractEnum.Contract),
                Name = ContractEnum.Contract.DescriptionAttr()
            };
            list.Add(contract);

            var Customer = new Properties
            {
                Code = EnumHelper<CustomerEnum>.GetDisplayValue(CustomerEnum.Customer),
                Name = CustomerEnum.Customer.DescriptionAttr()
            };
            list.Add(Customer);

            var Supplier = new Properties
            {
                Code = EnumHelper<SupplierEnum>.GetDisplayValue(SupplierEnum.Supplier),
                Name = SupplierEnum.Supplier.DescriptionAttr()
            };
            list.Add(Supplier);
            return Json(list);
        }

        [HttpPost]
        public object GetUsers()
        {
            var query = from a in _context.Users
                        select new
                        {
                            UserName = a.UserName,
                            Name = a.GivenName
                        };
            var list = query.ToList();
            return list;
        }

        [HttpGet]
        public IActionResult Download(int Id)
        {
            try
            {
                var data = (from a in _context.EDMSRepoCatFiles.Where(x => x.Id == Id)
                            join b in _context.EDMSRepositorys on a.ReposCode equals b.ReposCode into b2
                            from b in b2.DefaultIfEmpty()
                            join c in _context.EDMSFiles on a.FileCode equals c.FileCode into c2
                            from c in c2.DefaultIfEmpty()
                            select new
                            {
                                a.Id,
                                Server = (b != null ? b.Server : null),
                                Type = (b != null ? b.Type : null),
                                Url = (c != null ? c.Url : null),
                                FileId = (c != null ? c.CloudFileId : null),
                                FileTypePhysic = c.FileTypePhysic,
                                c.FileName,
                                c.MimeType,
                                b.Account,
                                b.PassWord
                            }
                        ).FirstOrDefault();
                if (data != null)
                {
                    if (data.Type == "SERVER")
                    {
                        if (!string.IsNullOrEmpty(data.Server))
                        {
                            string ftphost = data.Server;
                            string ftpfilepath = data.Url;
                            var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + ftphost + ftpfilepath);
                            using (WebClient request = new WebClient())
                            {
                                request.Credentials = new NetworkCredential(data.Account, data.PassWord);
                                byte[] fileData = request.DownloadData(urlEnd);
                                return File(fileData, data.MimeType, string.Concat(data.FileName, data.FileTypePhysic));
                            }
                        }
                    }
                    else
                    {
                        var fileData = FileExtensions.DowloadFileGoogle(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", data.FileId);
                        return File(fileData, data.MimeType, string.Concat(data.FileName, data.FileTypePhysic));
                    }
                }
            }
            catch (Exception ex)
            {

            }
            return null;
        }

        [HttpGet]
        public IActionResult DownloadSearch(int Id, string content)
        {
            try
            {
                var data = (from a in _context.EDMSRepoCatFiles.Where(x => x.Id == Id)
                            join b in _context.EDMSRepositorys on a.ReposCode equals b.ReposCode into b2
                            from b in b2.DefaultIfEmpty()
                            join c in _context.EDMSFiles on a.FileCode equals c.FileCode into c2
                            from c in c2.DefaultIfEmpty()
                            select new
                            {
                                a.Id,
                                Server = (b != null ? b.Server : null),
                                Type = (b != null ? b.Type : null),
                                Url = (c != null ? c.Url : null),
                                FileId = (c != null ? c.CloudFileId : null),
                                FileTypePhysic = c.FileTypePhysic,
                                c.FileName,
                                c.MimeType,
                                b.Account,
                                b.PassWord,
                                c.FileCode
                            }
                        ).FirstOrDefault();
                if (data != null)
                {
                    if (data.Type == "SERVER")
                    {
                        if (!string.IsNullOrEmpty(data.Server))
                        {
                            string ftphost = data.Server;
                            string ftpfilepath = data.Url;
                            var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + ftphost + ftpfilepath);
                            using (WebClient request = new WebClient())
                            {
                                request.Credentials = new NetworkCredential(data.Account, data.PassWord);
                                byte[] fileData = request.DownloadData(urlEnd);
                                JMessage msg1 = _upload.UploadFileByBytes(fileData, data.FileName, _hostingEnvironment.WebRootPath, "uploads\\tempFile");
                                string path = msg1.Object.ToString();
                                List<string> arr = new List<string>();
                                arr.Add(content);
                                if (!string.IsNullOrEmpty(content) && Array.IndexOf(word, data.FileTypePhysic.ToUpper()) >= 0)
                                {
                                    try
                                    {
                                        UpdateFileWord(path, arr, data.FileTypePhysic);
                                    }
                                    catch (Exception ex) { }
                                }
                                else if (!string.IsNullOrEmpty(content) && Array.IndexOf(pdf, data.FileTypePhysic.ToUpper()) >= 0)
                                {
                                    UpdateFilePdf(path, arr, data.FileTypePhysic);
                                }
                                else if (!string.IsNullOrEmpty(content) && Array.IndexOf(excel, data.FileTypePhysic.ToUpper()) >= 0)
                                {
                                    UpdateFileExcel(path, arr, data.FileTypePhysic);
                                }
                                byte[] bytes = System.IO.File.ReadAllBytes(Path.Combine(_hostingEnvironment.WebRootPath, path));
                                return File(bytes, data.MimeType, data.FileName);
                            }
                        }
                    }
                    else
                    {
                        byte[] fileData = FileExtensions.DowloadFileGoogle(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", data.FileId);
                        JMessage msg1 = _upload.UploadFileByBytes(fileData, data.FileName, _hostingEnvironment.WebRootPath, "uploads\\tempFile");
                        string path = msg1.Object.ToString();
                        List<string> arr = new List<string>();
                        arr.Add(content);
                        if (!string.IsNullOrEmpty(content) && Array.IndexOf(word, data.FileTypePhysic.ToUpper()) >= 0)
                        {
                            try
                            {
                                UpdateFileWord(path, arr, data.FileTypePhysic);
                            }
                            catch (Exception ex) { }
                        }
                        else if (!string.IsNullOrEmpty(content) && Array.IndexOf(pdf, data.FileTypePhysic.ToUpper()) >= 0)
                        {
                            UpdateFilePdf(path, arr, data.FileTypePhysic);
                        }
                        else if (!string.IsNullOrEmpty(content) && Array.IndexOf(excel, data.FileTypePhysic.ToUpper()) >= 0)
                        {
                            UpdateFileExcel(path, arr, data.FileTypePhysic);
                        }
                        byte[] bytes = System.IO.File.ReadAllBytes(Path.Combine(_hostingEnvironment.WebRootPath, path));
                        return File(bytes, data.MimeType, data.FileName);
                    }
                }
            }
            catch (Exception ex)
            {

            }
            return null;
        }
        #endregion

        #region Connection ftp,google driver
        public class JtableDirectoryModel : JTableModel
        {
            public string ReposCode { get; set; }
            public string Folder { get; set; }
            public string ParentId { get; set; }
            public string CatCode { get; set; }
        }

        [HttpPost]
        public object JtableFileWithRepository([FromBody]JtableDirectoryModel jTablePara)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
                var repos = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == jTablePara.ReposCode);
                if (repos != null)
                {
                    if (repos.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server))
                    {
                        var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + repos.Server + jTablePara.Folder);
                        var list = FileExtensions.GetFileFtpServer(urlEnd, repos.Account, repos.PassWord);
                        var count = list.Count();
                        var data = list.Skip(intBeginFor).Take(jTablePara.Length).ToList();
                        var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "FileName", "FileSize", "IsDirectory", "LastModifiedDate");
                        return Json(jdata);
                    }
                    else if (repos.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.GooglerDriver))
                    {
                        var list = FileExtensions.GetFileGoogleFile(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", jTablePara.ParentId);
                        var count = list.Count();
                        var data = list.Skip(intBeginFor).Take(jTablePara.Length).ToList();
                        var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "FileName", "FileSize", "IsDirectory", "LastModifiedDate", "MimeType");
                        return Json(jdata);
                    }
                    else
                    {
                        var jdata = JTableHelper.JObjectTable(new List<FtpFileInfo>(), jTablePara.Draw, 0, "Id", "FileName", "FileSize", "IsDirectory", "LastModifiedDate");
                        return Json(jdata);
                    }
                }
                else
                {
                    var jdata = JTableHelper.JObjectTable(new List<FtpFileInfo>(), jTablePara.Draw, 0, "Id", "FileName", "FileSize", "IsDirectory", "LastModifiedDate");
                    return Json(jdata);
                }
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
        public object JtableFolderWithRepository([FromBody]JtableDirectoryModel jTablePara)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
                var repos = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == jTablePara.ReposCode);
                if (repos != null)
                {
                    if (repos.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server))
                    {
                        var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + repos.Server + jTablePara.Folder);
                        var list = FileExtensions.GetFileFtpServer(urlEnd, repos.Account, repos.PassWord).Where(x => x.IsDirectory);
                        var count = list.Count();
                        var data = list.Skip(intBeginFor).Take(jTablePara.Length).ToList();
                        var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "FileName", "FileSize", "IsDirectory", "LastModifiedDate");
                        return Json(jdata);
                    }
                    else if (repos.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.GooglerDriver))
                    {
                        var list = FileExtensions.GetFolderGoogleFile(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", jTablePara.ParentId);
                        var count = list.Count();
                        var data = list.Skip(intBeginFor).Take(jTablePara.Length).ToList();
                        var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "FileName", "FileSize", "IsDirectory", "LastModifiedDate", "MimeType");
                        return Json(jdata);
                    }
                    else
                    {
                        var jdata = JTableHelper.JObjectTable(new List<FtpFileInfo>(), jTablePara.Draw, 0, "Id", "FileName", "FileSize", "IsDirectory", "LastModifiedDate");
                        return Json(jdata);
                    }
                }
                else
                {
                    var jdata = JTableHelper.JObjectTable(new List<FtpFileInfo>(), jTablePara.Draw, 0, "Id", "FileName", "FileSize", "IsDirectory", "LastModifiedDate");
                    return Json(jdata);
                }
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
        public object JtableFolderSettingWithCategory([FromBody]JtableDirectoryModel jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.EDMSCatRepoSettings
                        where a.CatCode == jTablePara.CatCode
                        select new
                        {
                            a.Id,
                            a.ReposCode,
                            a.FolderName,
                            a.Path,
                            a.FolderId
                        };
            int count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "ReposCode", "FolderName", "Path", "FolderId");
            return jdata;
        }
        #endregion

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_contractController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion
    }
}
public class EDMSRepositoryUserModel
{
    public string Id { get; set; }
    public string UserName { get; set; }
}
public class EDMSRepositoryFileModel
{
    public string FileCode { get; set; }
    public string FileName { get; set; }
    public string FileType { get; set; }
    public string Tags { get; set; }
    public string Desc { get; set; }
    public string ReposCode { get; set; }
    public string FilePath { get; set; }
}
public class JtableFileModel : JTableModel
{
    public string ObjectType { get; set; }
    public string ObjectCode { get; set; }
    public string FromDate { get; set; }
    public string ToDate { get; set; }
    public string Name { get; set; }
    public int? FileType { get; set; }
    public string Content { get; set; }
    public string Tags { get; set; }
    public string[] ListRepository { get; set; }
    public string TypeTab { get; set; }
    public string ContractCode { get; set; }
    public string CustomerCode { get; set; }
    public string SupplierCode { get; set; }
    public string ProjectCode { get; set; }
    public string UserUpload { get; set; }
    public bool RecentFile { get; set; }
}
public class EDMSJtableFileModel
{
    //Id bảng 
    public int Id { get; set; }
    public int FileID { get; set; }
    public string FileCode { get; set; }
    public string FileName { get; set; }
    public string FileTypePhysic { get; set; }
    public string CreatedBy { get; set; }
    public DateTime? CreatedTime { get; set; }
    public string Tags { get; set; }
    public string Url { get; set; }
    public string Content { get; set; }
    public string MimeType { get; set; }
    public string ReposName { get; set; }
    public string CloudFileId { get; set; }
    public string ServerAddress { get; set; }
    public string Category { get; set; }
    public string FolderName { get; set; }
    public decimal FileSize { get; set; }
    public decimal SizeOfFile { get; set; }
    public string Line { get; set; }
    public string Page { get; set; }
    public string CatName { get; set; }
}

public class JTableModelFile : JTableModel
{
    public int? FileID { get; set; }
    public string RequestCode { get; set; }
    public string FromDate { get; set; }
    public string ToDate { get; set; }
    public string CatCode { get; set; }
}

//Category
//[HttpPost]
//public object JtreeRepository()
//{
//    var getRepository = _context.EDMSRepositorys.Where(x => !x.IsDeleted).OrderByDescending(x => x.ReposID).AsNoTracking();
//    return getRepository;
//}

//[HttpPost]
//public List<TreeViewResource> GetTreeRepository()
//{
//    var data = _context.EDMSRepositorys.Where(x => x.IsDeleted == false).OrderByDescending(x => x.ReposID).AsNoTracking();
//    var dataOrder = GetSubTreeData(data.ToList(), null, new List<TreeViewResource>(), 0);
//    return dataOrder;
//}




//[HttpGet]
//public JsonResult GetItemRepository(string reposCode)
//{
//    var msg = new JMessage { Error = false, Title = "" };
//    try
//    {
//        var data = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == reposCode);
//        if (data != null)
//        {
//            var model = new EDMSRepository
//            {
//                ReposID = data.ReposID,
//                ReposCode = data.ReposCode,
//                ReposName = data.ReposName,
//                Account = data.Account,
//                Parent = data.Parent,
//                Token = data.Token,
//                PathPhysic = data.PathPhysic
//            };
//            msg.Object = model;
//        }
//        else
//        {
//            msg.Error = true;
//            msg.Title = String.Format(_stringLocalizer["EDMSR_MSG_REPOSITORY_NOT_EXIST"));//"Kho dữ liệu không tồn tại";
//        }
//    }
//    catch (Exception ex)
//    {
//        msg.Error = true;
//        msg.Object = ex.Message;
//        msg.Title = String.Format(_stringLocalizer["EDMSR_MSG_ERROR_REPOSITORY"));//"Có lỗi khi lấy kho dữ liệu!";
//    }
//    return Json(msg);
//}

//[HttpPost]
//public JsonResult InsertRepository([FromBody]EDMSRepository obj)
//{
//    var msg = new JMessage { Error = false, Title = "" };
//    try
//    {
//        if (obj == null)
//        {
//            msg.Error = true;
//            msg.Title = String.Format(_stringLocalizer["EDMSR_MSG_ADD_REPOSITORY_ERROR"));//"Có lỗi khi thêm kho dữ liệu!";
//        }
//        else
//        {
//            //check exist code
//            var checkExistCode = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == obj.ReposCode);
//            if (checkExistCode != null)
//            {
//                msg.Error = true;
//                msg.Title = String.Format(_stringLocalizer["EDMSR_MSG_REPOSITORY_CODE_EXISTED"));//"Mã kho dữ liệu đã tồn tại";
//            }
//            else
//            {
//                if (string.IsNullOrEmpty(obj.Parent))
//                {
//                    string pathUpload = _hostingEnvironment.WebRootPath + Path.Combine("\\uploads\\repository", obj.ReposName);
//                    if (System.IO.Directory.Exists(pathUpload))
//                    {
//                        msg.Error = true;
//                        msg.Title = String.Format(_stringLocalizer["EDMSR_MSG_REPOSITORY_NAME_EXISTED"));//"Tên kho dữ liệu đã tồn tại";
//                    }
//                    else
//                    {
//                        System.IO.Directory.CreateDirectory(pathUpload);
//                        obj.Parent = "#";
//                        obj.CreatedBy = ESEIM.AppContext.UserName;
//                        obj.CreatedTime = DateTime.Now;
//                        obj.PathPhysic = Path.Combine("\\uploads\\repository", obj.ReposName);
//                        _context.EDMSRepositorys.Add(obj);
//                        _context.SaveChanges();
//                        msg.Title = String.Format(_stringLocalizer["EDMSR_MSG_CREATE_SUCCESS_REPOSITORY"));//"Tạo kho dữ liệu thành công";
//                    }
//                }
//                else
//                {
//                    var getParent = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == obj.Parent);
//                    string pathUpload = _hostingEnvironment.WebRootPath + Path.Combine(getParent.PathPhysic, obj.ReposName);
//                    if (System.IO.Directory.Exists(pathUpload))
//                    {
//                        msg.Error = true;
//                        msg.Title = String.Format(_stringLocalizer["EDMSR_MSG_REPOSITORY_NAME_EXISTED"));//"Tên kho dữ liệu đã tồn tại";
//                    }
//                    else
//                    {
//                        System.IO.Directory.CreateDirectory(pathUpload);
//                        obj.Parent = obj.Parent;
//                        obj.CreatedBy = ESEIM.AppContext.UserName;
//                        obj.CreatedTime = DateTime.Now;
//                        obj.PathPhysic = Path.Combine(getParent.PathPhysic, obj.ReposName);
//                        _context.EDMSRepositorys.Add(obj);
//                        _context.SaveChanges();
//                        msg.Title = String.Format(_stringLocalizer["EDMSR_MSG_CREATE_SUCCESS_REPOSITORY"));//"Tạo kho dữ liệu thành công";
//                    }
//                }
//            }
//        }
//    }
//    catch (Exception ex)
//    {
//        msg.Error = true;
//        msg.Object = ex.Message;
//        msg.Title = String.Format(_stringLocalizer["EDMSR_MSG_ADD_REPOSITORY_FALSE"));// "Thêm kho dữ liệu sai!";
//    }
//    return Json(msg);
//}

//[HttpPost]
//public JsonResult UpdateRepository([FromBody]EDMSRepository obj)
//{
//    var msg = new JMessage { Error = false, Title = "" };
//    try
//    {
//        if (obj == null)
//        {
//            msg.Error = true;
//            msg.Title = String.Format(_stringLocalizer["EDMSR_MSG_UPDATE_REPOSITORY_FALSE"));//"Cập nhập kho dữ liệu sai!";
//        }
//        else
//        {
//            var data = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == obj.ReposCode);
//            if (data != null)
//            {
//                data.ReposName = obj.ReposName;
//                data.Account = obj.Account;
//                data.Desc = obj.Desc;
//                data.Server = obj.Server;
//                data.Token = obj.Token;
//                data.UpdatedBy = ESEIM.AppContext.UserName;
//                data.UpdatedTime = DateTime.Now;
//                if (data.Parent != obj.Parent)
//                {
//                    var parent = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == obj.Parent);
//                    if (parent == null)
//                    {
//                        if (data.Parent != "#")
//                        {
//                            var soure = _hostingEnvironment.WebRootPath + data.PathPhysic;
//                            var des = _hostingEnvironment.WebRootPath + "\\uploads\\repository";
//                            Directory.Move(soure, Path.Combine(des, data.ReposName));
//                            data.Parent = "#";
//                            data.PathPhysic = Path.Combine("\\uploads\\repository", data.ReposName);
//                            var listChild = _context.EDMSRepositorys.Where(x => x.ReposCode == data.ReposCode).Traverse(y => _context.EDMSRepositorys.Where(child => y.ReposCode == child.Parent)).Where(z => z.ReposCode != data.ReposCode).ToList();
//                            UpdatePathChild(listChild, data.ReposCode, data.PathPhysic);
//                        }
//                    }
//                    else
//                    {
//                        var soure = _hostingEnvironment.WebRootPath + data.PathPhysic;
//                        var des = _hostingEnvironment.WebRootPath + parent.PathPhysic;
//                        if (System.IO.Directory.Exists(Path.Combine(des, data.ReposName)))
//                        {
//                            msg.Error = true;
//                            msg.Title = "Tên kho dữ liệu chuyển tới đã tồn tại!";//"Cập nhập kho dữ liệu thành công";
//                            return Json(msg);
//                        }
//                        Directory.Move(soure, Path.Combine(des, data.ReposName));
//                        data.Parent = obj.Parent;
//                        data.PathPhysic = Path.Combine(parent.PathPhysic, data.ReposName);
//                        var listChild = _context.EDMSRepositorys.Where(x => x.ReposCode == data.ReposCode).Traverse(y => _context.EDMSRepositorys.Where(child => y.ReposCode == child.Parent)).Where(z => z.ReposCode != data.ReposCode).ToList();
//                        UpdatePathChild(listChild, data.ReposCode, data.PathPhysic);
//                    }
//                }
//                else
//                {
//                    if (data.ReposName != obj.ReposName)
//                    {
//                        var soure = _hostingEnvironment.WebRootPath + data.PathPhysic;
//                        var des = soure.Replace(data.ReposName, obj.ReposName);
//                        Directory.Move(soure, Path.Combine(des, data.ReposName));
//                        data.PathPhysic = des;
//                        var listChild = _context.EDMSRepositorys.Where(x => x.ReposCode == data.ReposCode).Traverse(y => _context.EDMSRepositorys.Where(child => y.ReposCode == child.Parent)).Where(z => z.ReposCode != data.ReposCode).ToList();
//                        UpdatePathChild(listChild, data.ReposCode, data.PathPhysic);
//                    }
//                }
//                _context.EDMSRepositorys.Update(data);
//                _context.SaveChanges();
//                msg.Title = String.Format(_stringLocalizer["EDMSR_MSG_UPDATE_REPOSITORY_SUCCESS"));//"Cập nhập kho dữ liệu thành công";
//            }
//            else
//            {
//                msg.Error = true;
//                msg.Title = String.Format(_stringLocalizer["EDMSR_MSG_REPOSITORY_NOT_EXIST"));//"Kho dữ liệu không tồn tại!";
//            }
//        }
//    }
//    catch (Exception ex)
//    {
//        msg.Error = true;
//        msg.Object = ex.Message;
//        msg.Title = String.Format(_stringLocalizer["EDMSR_MSG_UPDATE_REPOSITORY_ERROR"));// "Cập nhập kho dữ liệu lỗi!";
//    }
//    return Json(msg);
//}

//[HttpPost]
//public JsonResult DeleteRepository(string reposCode)
//{
//    var msg = new JMessage { Error = false, Title = "" };
//    try
//    {
//        var repository = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == reposCode);
//        var listFile = _context.EDMSFiles.Where(x => x.ReposCode == reposCode);
//        if (System.IO.Directory.Exists(_hostingEnvironment.WebRootPath + repository.PathPhysic))
//            System.IO.Directory.Delete(_hostingEnvironment.WebRootPath + repository.PathPhysic, true);
//        _context.EDMSRepositorys.Remove(repository);
//        _context.EDMSFiles.RemoveRange(listFile);
//        _context.SaveChanges();
//        msg.Title = String.Format(_stringLocalizer["EDMSR_MSG_DELETE_REPOSITORY_SUCCESS"));//"Xóa thành công kho dữ liệu";
//    }
//    catch (Exception ex)
//    {
//        msg.Error = true;
//        msg.Object = ex.Message;
//        msg.Title = String.Format(_stringLocalizer["EDMSR_MSG_DELETE_REPOSITORY_ERROR"));//"Xóa kho dữ liệu lỗi";
//    }
//    return Json(msg);
//}
//[NonAction]
//public void UpdatePathChild(List<EDMSRepository> data, string parentCode, string pathParent)
//{
//    var contents = data.Where(x => x.Parent == parentCode).OrderByDescending(x => x.ReposCode).AsParallel();
//    foreach (var item in contents)
//    {
//        item.PathPhysic = Path.Combine(pathParent, item.ReposName);
//        _context.EDMSRepositorys.Update(item);
//        var hasChild = data.Any(x => x.Parent == item.ReposCode);
//        if (hasChild) UpdatePathChild(data, item.ReposCode, item.PathPhysic);
//    }
//}
//End category