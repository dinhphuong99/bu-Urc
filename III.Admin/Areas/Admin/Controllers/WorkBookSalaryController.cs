using System;
using System.Collections.Generic;
using System.Data;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using III.Domain.Enums;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using OpenXmlPowerTools;
using Syncfusion.EJ2.DocumentEditor;
using Syncfusion.EJ2.Spreadsheet;
using Syncfusion.XlsIO;
using System.Net.Http;
using System.Text;
using Microsoft.AspNetCore.Http.Internal;
using ESEIM;
using Syncfusion.Drawing;
using System.Net;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class WorkBookSalaryController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IStringLocalizer<WorkBookSalaryController> _stringLocalizer;
        public static AseanDocument docmodel = new AseanDocument();
        public static string _month = new string("");
        public static string pathFile = new string("");
        public static string cardCode = new string("");
        public static string pathFileFTP = new string("");
        public WorkBookSalaryController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment,
            IStringLocalizer<WorkBookSalaryController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _hostingEnvironment = hostingEnvironment;
            _context = context;
            _upload = upload;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }
        public IActionResult Index()
        {
            return View();
        }

        #region Open, export and Save Excel
        public IActionResult OpenFromLocal(IFormCollection openRequest)
        {
            OpenRequest open = new OpenRequest();
            open.File = openRequest.Files[0];
            return Content(Workbook.Open(open));
        }
        public object Save(SaveSettings saveSettings)
        {
            DateTime? monthTime = !string.IsNullOrEmpty(_month) ? DateTime.ParseExact(_month, "MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDay = DateTime.Now;
            var msg = new JMessage();
            ExcelEngine excelEngine = new ExcelEngine();
            IApplication application = excelEngine.Excel;
            Stream fileStream = Workbook.Save<Stream>(saveSettings);
            IWorkbook workbook = application.Workbooks.Open(fileStream);
            string urlFile = "";
            string path = "/7. BẢNG LƯƠNG";
            var fileName = string.Format("Salary_{0}{1}{2}.xlsx", (monthTime.HasValue ? monthTime.Value.Month : toDay.Month), (monthTime.HasValue ? monthTime.Value.Year : toDay.Year), toDay.ToString("HHmmss"));

            using (FileStream outputFileStream = new FileStream(string.Concat(_hostingEnvironment.WebRootPath, pathFile), FileMode.Create))
            {
                fileStream.CopyTo(outputFileStream);
                workbook.SaveAs(outputFileStream);
                outputFileStream.Close();
            }

            SaveDataDB(_month);

            var getRepository = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == "02");
            if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server))
            {
                using (var ms = new MemoryStream())
                {
                    using (FileStream outputFileStream = new FileStream(string.Concat(_hostingEnvironment.WebRootPath, pathFile), FileMode.Open))
                    {
                        fileStream.CopyTo(outputFileStream);
                        outputFileStream.CopyTo(ms);
                        outputFileStream.Close();
                    }

                    var fileBytes = ms.ToArray();
                    urlFile = path + Path.Combine("/", fileName);
                    var urlFilePreventive = path + Path.Combine("/", Guid.NewGuid().ToString().Substring(0, 8) + fileName);
                    var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + getRepository.Server + urlFile);
                    var urlEndPreventive = System.Web.HttpUtility.UrlPathEncode("ftp://" + getRepository.Server + urlFilePreventive);
                    var result = FileExtensions.UploadFileToFtpServer(urlEnd, urlEndPreventive, fileBytes, getRepository.Account, getRepository.PassWord);
                    if (result.Status == WebExceptionStatus.ConnectFailure || result.Status == WebExceptionStatus.ProtocolError)
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["WBS_MSG_ERR_CONNECTION"];
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
                    }
                }
                var edmsReposCatFile = new EDMSRepoCatFile
                {
                    FileCode = string.Concat("REPOSITORY", Guid.NewGuid().ToString()),
                    ReposCode = "02",
                    CatCode = "SALARY",
                    ObjectCode = null,
                    ObjectType = null,
                    Path = path,
                    FolderId = ""
                };

                //LuceneExtension.IndexFile(edmsReposCatFile.FileCode, new FormFile(fileStream, 0, fileStream.Length), string.Concat(_hostingEnvironment.WebRootPath, "\\uploads\\luceneIndex"));

                var file = new EDMSFile
                {
                    FileCode = edmsReposCatFile.FileCode,
                    FileName = fileName,
                    Desc = "",
                    ReposCode = "02",
                    Tags = "",
                    FileSize = fileStream.Length,
                    FileTypePhysic = ".xlsx",
                    NumberDocument = "",
                    CreatedBy = ESEIM.AppContext.UserName,
                    CreatedTime = DateTime.Now,
                    Url = urlFile,
                    MimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    CloudFileId = "",
                };

                _context.EDMSFiles.Add(file);
                _context.EDMSRepoCatFiles.Add(edmsReposCatFile);
                _context.SaveChanges();
            }

            //var pathSaveToFtp = _hostingEnvironment.WebRootPath + "/uploads/repository/" + path + fileName;
            //using (FileStream outputFileStream = new FileStream(pathSaveToFtp, FileMode.Create))
            //{
            //    fileStream.CopyTo(outputFileStream);
            //    workbook.SaveAs(outputFileStream);
            //    outputFileStream.Close();
            //}
            //workbook.Close();

            return Response.WriteAsync("<script>location.href = '/Admin/WorkBookSalary'</script>"); ;
        }

        #endregion

        #region Calculate Salary
        [HttpPost]
        public JsonResult GetEmployee()
        {
            var data = from a in _context.HREmployees.Where(x => x.flag == 1)
                       join b in _context.Users.Where(x => x.Active) on a.Id.ToString() equals b.EmployeeCode into b1
                       from b2 in b1.DefaultIfEmpty()
                       select new
                       {
                           Code = a.Id,
                           Name = a.fullname
                       };
            return Json(data);
        }
        [HttpPost]
        public JsonResult CalSalary(string month, string user)
        {
            _month = month;
            DateTime? time = !string.IsNullOrEmpty(month) ? DateTime.ParseExact(month, "MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var year = 0;
            var monthRecei = 0;
            if (string.IsNullOrEmpty(month))
            {
                var currentTime = DateTime.Now;
                year = currentTime.Year;
                monthRecei = currentTime.Month;
            }
            else
            {
                year = time.Value.Year;
                monthRecei = time.Value.Month;
            }

            var userName = "";
            if (!string.IsNullOrEmpty(user))
            {
                var aspNetUser = _context.Users.FirstOrDefault(x => x.Active && x.EmployeeCode == user);
                userName = aspNetUser != null ? aspNetUser.UserName : "";
            }

            var timeWorking = TimeWorkKing(monthRecei, year, userName);

            var query = from a in _context.HREmployees.Where(x => x.flag == 1)
                        join b in _context.Roles.Where(x => x.Status == true) on a.position equals b.Id into b1
                        from b2 in b1.DefaultIfEmpty()
                        join c in _context.HRContracts.Where(x => x.flag == 1) on a.Id equals c.Employee_Id into c1
                        from c2 in c1.DefaultIfEmpty()
                        join d in _context.Users.Where(x => x.Active) on a.Id.ToString() equals d.EmployeeCode into d1
                        from d2 in d1.DefaultIfEmpty()
                        where (string.IsNullOrEmpty(user) || a.Id.ToString() == user)
                        select new
                        {
                            a.Id,
                            FullName = a.fullname,
                            Position = b2 != null ? b2.Title : "",
                            Salary = c2 != null ? c2.Salary : 0,
                            UserName = d2 != null ? d2.UserName : "",
                            SalaryRatio = (c2 != null && !string.IsNullOrEmpty(c2.Salary_Ratio)) ? c2.Salary_Ratio : "1",
                            c2.Created_Time
                        };

            var query1 = query.OrderByDescending(x => x.Created_Time).GroupBy(x => x.Id).Select(x => x.FirstOrDefault());
            if (timeWorking.Count() > 0)
            {
                var data = (from a in query1
                            join b in timeWorking on a.UserName equals b.UserName into b1
                            from b2 in b1.DefaultIfEmpty()
                            select new ExcelSalary
                            {
                                FullName = a.FullName,
                                Position = a.Position,
                                Salary = a.Salary,
                                TimeWorking = b2.TimeWorking.HasValue ? b2.TimeWorking : 0,
                                SalaryRatio = a.SalaryRatio
                            }).ToList();
                var path = "\\" + CreateFile(data, monthRecei, year);
                pathFile = path;
                return Json(path);
            }
            else
            {
                var data = (from a in query1
                            select new ExcelSalary
                            {
                                FullName = a.FullName,
                                Position = a.Position,
                                Salary = a.Salary,
                            }).ToList();
                var path = "\\" + CreateFile(data, monthRecei, year);
                pathFile = path;
                return Json(path);
            }
        }

        [HttpPost]
        public JsonResult InsertExcelDataDB(string monthSalary)
        {
            var list = new List<ExcelSalaryModel>();
            try
            {
                var pathUpload = string.Concat(_hostingEnvironment.WebRootPath, pathFile);
                Stream fileStreamPath = new FileStream(pathUpload, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
                var fileUpload = new FormFile(fileStreamPath, 0, fileStreamPath.Length, "Test", "Test.xlsx");

                if (fileUpload != null && fileUpload.Length > 0)
                {
                    // Read content from file
                    ExcelEngine excelEngine = new ExcelEngine();
                    IApplication application = excelEngine.Excel;
                    IWorkbook workbook = application.Workbooks.Create();
                    workbook = application.Workbooks.Open(fileUpload.OpenReadStream());
                    IWorksheet worksheet = workbook.Worksheets[0];

                    if (worksheet.Rows.Length > 1)
                    {
                        DateTime? monthTime = !string.IsNullOrEmpty(monthSalary) ? DateTime.ParseExact(monthSalary, "MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                        var month = monthSalary.Split("/");
                        var codeSalary = string.Format("SALARY_T{0}_{1}", month[0], month[1]);
                        string[] excelColums = { "V", "W", "X", "Y", "Z", "AA", "AB", "AC", "AD", "AE" };//Các cột phụ cấp
                        var alphas = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".ToArray();
                        var listAllowance = _context.AttributeManagers.Where(x => !x.IsDeleted && x.Group.Equals("ATTR_GROUP_ALLOWANCE")).ToList();//Lấy danh sách phụ cấp
                        var listUser = _context.Users.Where(x => x.Active).Select(x => new { x.GivenName, x.UserName }).ToList();//Lấy danh sách người dùng
                        var listAllowanceExcelData = new List<SalaryTableAllowance>();
                        //Phần Header Bảng lương
                        var salaryHeader = new SalaryTableHeader
                        {
                            CodeTblSalary = codeSalary,
                            MonthSalary = monthTime,
                            Title = string.Format("Bảng lương tháng {0}", monthSalary),
                            Total = 0,
                            CreatedBy = User.Identity.Name,
                            CreatedTime = DateTime.Now
                        };

                        var length = worksheet.Rows.Length;
                        for (int i = 4; i <= length; i++)
                        {

                            var a = worksheet.Range[i, 4].DisplayText;

                            for (int j = 0; j < alphas.Length; j++)
                            {
                                var col = alphas[j].ToString() + i;

                            }

                            //Đọc dữ liệu từng dòng
                            var EmployeeCode = worksheet.GetText(i, 2).ToString().Trim();
                            if (!string.IsNullOrEmpty(EmployeeCode))
                                EmployeeCode = listUser.FirstOrDefault(x => x.GivenName.Equals(EmployeeCode)) != null ? listUser.FirstOrDefault(x => x.GivenName.Equals(EmployeeCode)).UserName : EmployeeCode;

                            var EmployeeName = worksheet.GetText(i, 2).ToString().Trim();
                            var EmployeeRole = worksheet.GetText(i, 3).ToString().Trim();
                            var CodeTblSalary = codeSalary;
                            var SalaryPrimary = worksheet.Range[i, 4].DisplayText.ToString().Trim();//Lương chính
                            var SalaryTotal = worksheet.Range[i, 4].DisplayText.ToString().Trim();//Tổng thu nhập
                            var WorkDay = worksheet.Range[i, 6].DisplayText.ToString().Trim();//Ngày công
                            var SalaryGross = worksheet.Range[i, 7].DisplayText.ToString().Trim();//Tổng lương thực tế
                            var SalaryPayInsurance = worksheet.Range[i, 8].DisplayText.ToString().Trim();//Lương đóng bảo hiểm

                            var UnionFunds = worksheet.Range[i, 9].DisplayText.ToString().Trim();//CPCĐ
                            var SocialInsuranceComp = worksheet.Range[i, 10].DisplayText.ToString().Trim();//BHXH (Công ty chi trả)
                            var HealthInsuranceComp = worksheet.Range[i, 11].DisplayText.ToString().Trim();//BHYT (Công ty chi trả)
                            var UnemploymentInsuranceComp = worksheet.Range[i, 12].DisplayText.ToString().Trim();//BHTN (Công ty chi trả)

                            var SocialInsuranceEmp = worksheet.Range[i, 14].DisplayText.ToString().Trim();//BHXH (Nhân viên chi trả)
                            var HealthInsuranceEmp = worksheet.Range[i, 15].DisplayText.ToString().Trim();//BHYT (Nhân viên chi trả)
                            var UnemploymentInsuranceEmp = worksheet.Range[i, 16].DisplayText.ToString().Trim();//BHTN (Nhân viên chi trả)

                            var PersonalIncomeTax = worksheet.Range[i, 18].DisplayText.ToString().Trim();//TNCN
                            var SalaryBefore = worksheet.Range[i, 19].DisplayText.ToString().Trim();//Tạm ứng
                            var SalaryReceived = worksheet.Range[i, 20].DisplayText.ToString().Trim();//Lương thực lĩnh
                            var Note = worksheet.Range[i, 21].DisplayText.ToString().Trim();//Ghi chú

                            //Phần Detail Bảng lương
                            var salaryTableDetail = new SalaryTableDetail
                            {
                                EmployeeCode = EmployeeCode,
                                EmployeeName = EmployeeName,
                                EmployeeRole = EmployeeRole,
                                CodeTblSalary = CodeTblSalary,
                                SalaryPrimary = Decimal.Parse(SalaryPrimary),
                                SalaryTotal = Decimal.Parse(SalaryTotal),
                                WorkDay = Decimal.Parse(WorkDay),
                                SalaryGross = Decimal.Parse(SalaryGross),
                                SalaryPayInsurance = Decimal.Parse(SalaryPayInsurance),
                                UnionFunds = Decimal.Parse(UnionFunds),
                                SocialInsuranceComp = Decimal.Parse(SocialInsuranceComp),
                                UnemploymentInsuranceComp = Decimal.Parse(UnemploymentInsuranceComp),
                                SocialInsuranceEmp = Decimal.Parse(SocialInsuranceEmp),
                                UnemploymentInsuranceEmp = Decimal.Parse(UnemploymentInsuranceEmp),
                                PersonalIncomeTax = Decimal.Parse(PersonalIncomeTax),
                                SalaryBefore = Decimal.Parse(SalaryBefore),
                                SalaryReceived = Decimal.Parse(SalaryReceived),
                                Note = Note,
                                CreatedBy = User.Identity.Name,
                                CreatedTime = DateTime.Now
                            };

                            //Đọc phần phụ cấp
                            for (int j = 1; j <= listAllowance.Count; j++)
                            {
                                var AllownaceCode = listAllowance[j].Code;
                                var colum = 21 + j;
                                var salaryAllownace = new SalaryTableAllowance
                                {
                                    AllowanceCode = AllownaceCode,
                                    CodeTblSalary = CodeTblSalary,
                                    Value = Decimal.Parse(worksheet.Range[i, colum].DisplayText.ToString().Trim()),
                                    Month = monthTime,
                                    CreatedBy = User.Identity.Name,
                                    CreatedTime = DateTime.Now,
                                    EmployeeCode = EmployeeCode,
                                };

                                listAllowanceExcelData.Add(salaryAllownace);
                            }

                            var excelData = new ExcelSalaryModel
                            {
                                ListSalaryAllowance = listAllowanceExcelData,
                                SalaryTableDetail = salaryTableDetail
                            };

                            list.Add(excelData);
                        }
                    }
                }
            }
            catch (Exception e)
            {
            }
            return Json(list);
        }

        [NonAction]
        public JsonResult SaveDataDB(string monthSalary)
        {
            var list = new List<ExcelSalaryModel>();
            try
            {
                var pathUpload = string.Concat(_hostingEnvironment.WebRootPath, pathFile);
                Stream fileStreamPath = new FileStream(pathUpload, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
                var fileUpload = new FormFile(fileStreamPath, 0, fileStreamPath.Length, "Test", "Test.xlsx");
                if (fileUpload != null && fileUpload.Length > 0)
                {
                    // Read content from file
                    ExcelEngine excelEngine = new ExcelEngine();
                    IApplication application = excelEngine.Excel;
                    IWorkbook workbook = application.Workbooks.Create();
                    workbook = application.Workbooks.Open(fileUpload.OpenReadStream());
                    IWorksheet worksheet = workbook.Worksheets[0];

                    if (worksheet.Rows.Length > 1)
                    {
                        DateTime? monthTime = !string.IsNullOrEmpty(monthSalary) ? DateTime.ParseExact(monthSalary, "MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                        var month = monthSalary.Split("/");
                        var codeSalary = string.Format("SALARY_T{0}_{1}", month[0], month[1]);
                        string[] excelColums = { "V", "W", "X", "Y", "Z", "AA", "AB", "AC", "AD", "AE" };//Các cột phụ cấp
                        var alphas = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".ToArray();
                        var listAllowance = _context.AttributeManagers.Where(x => !x.IsDeleted && x.Group.Equals("ATTR_GROUP_ALLOWANCE")).ToList();//Lấy danh sách phụ cấp
                        var listUser = _context.Users.Where(x => x.Active).Select(x => new { x.GivenName, x.UserName }).ToList();//Lấy danh sách người dùng
                        var listAllowanceExcelData = new List<SalaryTableAllowance>();
                        var listDetailData = new List<SalaryTableDetail>();
                        //Phần Header Bảng lương
                        var salaryHeader = new SalaryTableHeader
                        {
                            CodeTblSalary = codeSalary,
                            MonthSalary = monthTime,
                            Title = string.Format("Bảng lương tháng {0}", monthSalary),
                            Total = 0,
                            CreatedBy = User.Identity.Name,
                            CreatedTime = DateTime.Now
                        };

                        //Hàm tính toán công thức
                        worksheet.EnableSheetCalculations();

                        var length = worksheet.Rows.Length;
                        for (int i = 4; i < length; i++)
                        {
                            //Đọc dữ liệu từng dòng
                            var EmployeeCode = worksheet.GetText(i, 2).ToString().Replace(",", "").Trim();
                            if (!string.IsNullOrEmpty(EmployeeCode))
                                EmployeeCode = listUser.FirstOrDefault(x => x.GivenName.Equals(EmployeeCode)) != null ? listUser.FirstOrDefault(x => x.GivenName.Equals(EmployeeCode)).UserName : EmployeeCode;

                            var EmployeeName = worksheet.GetText(i, 2).ToString().Replace(",", "").Trim();
                            var EmployeeRole = worksheet.GetText(i, 3).ToString().Replace(",", "").Trim();
                            var CodeTblSalary = codeSalary;
                            var SalaryPrimary = worksheet.Range[i, 4].DisplayText.ToString().Replace(",", "").Replace(",", "").Trim();//Lương chính
                            var SalaryTotal = worksheet.Range[i, 5].DisplayText.ToString().Replace(",", "").Trim();//Tổng thu nhập
                            var WorkDay = worksheet.Range[i, 6].DisplayText.ToString().Replace(",", "").Trim();//Ngày công
                            var SalaryGross = worksheet.Range[i, 7].DisplayText.ToString().Replace(",", "").Trim();//Tổng lương thực tế
                            var SalaryPayInsurance = worksheet.Range[i, 8].DisplayText.ToString().Replace(",", "").Trim();//Lương đóng bảo hiểm

                            var UnionFunds = worksheet.Range[i, 9].DisplayText.ToString().Replace(",", "").Trim();//CPCĐ
                            var SocialInsuranceComp = worksheet.Range[i, 10].DisplayText.ToString().Replace(",", "").Trim();//BHXH (Công ty chi trả)
                            var HealthInsuranceComp = worksheet.Range[i, 11].DisplayText.ToString().Replace(",", "").Trim();//BHYT (Công ty chi trả)
                            var UnemploymentInsuranceComp = worksheet.Range[i, 12].DisplayText.ToString().Replace(",", "").Trim();//BHTN (Công ty chi trả)

                            var SocialInsuranceEmp = worksheet.Range[i, 14].DisplayText.ToString().Replace(",", "").Trim();//BHXH (Nhân viên chi trả)
                            var HealthInsuranceEmp = worksheet.Range[i, 15].DisplayText.ToString().Replace(",", "").Trim();//BHYT (Nhân viên chi trả)
                            var UnemploymentInsuranceEmp = worksheet.Range[i, 16].DisplayText.ToString().Replace(",", "").Trim();//BHTN (Nhân viên chi trả)

                            var PersonalIncomeTax = worksheet.Range[i, 18].DisplayText.ToString().Replace(",", "").Trim();//TNCN
                            var SalaryBefore = worksheet.Range[i, 19].DisplayText.ToString().Replace(",", "").Trim();//Tạm ứng
                            var SalaryReceived = worksheet.Range[i, 20].DisplayText.ToString().Replace(",", "").Trim();//Lương thực lĩnh
                            //var Note = worksheet.Range[i, 21].DisplayText.ToString().Replace(",", "").Trim();//Ghi chú
                            var SalaryRatio = worksheet.Range[i, 21].DisplayText.ToString().Replace(",", "").Trim();//Hệ số lương

                            //Phần Detail Bảng lương
                            var salaryTableDetail = new SalaryTableDetail
                            {
                                EmployeeCode = EmployeeCode,
                                EmployeeName = EmployeeName,
                                EmployeeRole = EmployeeRole,
                                CodeTblSalary = CodeTblSalary,
                                SalaryPrimary = !string.IsNullOrEmpty(SalaryPrimary) ? Decimal.Parse(SalaryPrimary) : 0,
                                SalaryTotal = !string.IsNullOrEmpty(SalaryTotal) ? Decimal.Parse(SalaryTotal) : 0,
                                WorkDay = !string.IsNullOrEmpty(WorkDay) ? Decimal.Parse(WorkDay) : 0,
                                SalaryGross = !string.IsNullOrEmpty(SalaryGross) ? Decimal.Parse(SalaryGross) : 0,
                                SalaryPayInsurance = !string.IsNullOrEmpty(SalaryPayInsurance) ? Decimal.Parse(SalaryPayInsurance) : 0,
                                UnionFunds = !string.IsNullOrEmpty(UnionFunds) ? Decimal.Parse(UnionFunds) : 0,
                                SocialInsuranceComp = !string.IsNullOrEmpty(SocialInsuranceComp) ? Decimal.Parse(SocialInsuranceComp) : 0,
                                UnemploymentInsuranceComp = !string.IsNullOrEmpty(UnemploymentInsuranceComp) ? Decimal.Parse(UnemploymentInsuranceComp) : 0,
                                SocialInsuranceEmp = !string.IsNullOrEmpty(SocialInsuranceEmp) ? Decimal.Parse(SocialInsuranceEmp) : 0,
                                UnemploymentInsuranceEmp = !string.IsNullOrEmpty(UnemploymentInsuranceEmp) ? Decimal.Parse(UnemploymentInsuranceEmp) : 0,
                                HealthInsuranceComp = !string.IsNullOrEmpty(HealthInsuranceComp) ? Decimal.Parse(HealthInsuranceComp) : 0,
                                HealthInsuranceEmp = !string.IsNullOrEmpty(HealthInsuranceEmp) ? Decimal.Parse(HealthInsuranceEmp) : 0,
                                PersonalIncomeTax = !string.IsNullOrEmpty(PersonalIncomeTax) ? Decimal.Parse(PersonalIncomeTax) : 0,
                                SalaryBefore = !string.IsNullOrEmpty(SalaryBefore) ? Decimal.Parse(SalaryBefore) : 0,
                                SalaryReceived = !string.IsNullOrEmpty(SalaryReceived) ? Decimal.Parse(SalaryReceived) : 0,
                                //Note = Note,
                                SalaryRatio = !string.IsNullOrEmpty(SalaryRatio) ? Decimal.Parse(SalaryRatio) : 1,
                                CreatedBy = User.Identity.Name,
                                CreatedTime = DateTime.Now,
                            };

                            listDetailData.Add(salaryTableDetail);

                            //Đọc phần phụ cấp
                            for (int j = 0; j < listAllowance.Count; j++)
                            {
                                var AllownaceCode = listAllowance[j].Code;
                                var colum = 22 + j;
                                var value = worksheet.Range[i, colum].DisplayText.ToString().Trim();
                                var salaryAllownace = new SalaryTableAllowance
                                {
                                    AllowanceCode = AllownaceCode,
                                    CodeTblSalary = CodeTblSalary,
                                    Value = !string.IsNullOrEmpty(value) ? Decimal.Parse(value) : 0,
                                    Month = monthTime,
                                    CreatedBy = User.Identity.Name,
                                    CreatedTime = DateTime.Now,
                                    EmployeeCode = EmployeeCode,
                                };

                                listAllowanceExcelData.Add(salaryAllownace);
                            }

                            var excelData = new ExcelSalaryModel
                            {
                                ListSalaryAllowance = listAllowanceExcelData,
                                SalaryTableDetail = salaryTableDetail
                            };

                            list.Add(excelData);
                        }

                        if (list.Count > 0)
                        {
                            var header = _context.SalaryTableHeaders.FirstOrDefault(x => !x.IsDeleted && x.CodeTblSalary.Equals(salaryHeader.CodeTblSalary));
                            if (header == null)
                            {
                                _context.SalaryTableHeaders.Add(salaryHeader);
                            }

                            var listDetailBefore = _context.SalaryTableDetails.Where(x => !x.IsDeleted && listDetailData.Any(p => p.CodeTblSalary.Equals(x.CodeTblSalary) && p.EmployeeCode.Equals(x.EmployeeCode)));
                            if (listDetailBefore.Count() > 0)
                                _context.SalaryTableDetails.RemoveRange(listDetailBefore);

                            _context.SalaryTableDetails.Load();

                            var listDetail = listDetailData.Where(x => !x.IsDeleted && !_context.SalaryTableDetails.Local.Any(p => p.CodeTblSalary.Equals(x.CodeTblSalary) && p.EmployeeCode.Equals(x.EmployeeCode)));
                            if (listDetail.Count() > 0)
                                _context.SalaryTableDetails.AddRange(listDetail);

                            var listAllowanceDataBefore = _context.SalaryTableAllowances.Where(x => !x.IsDeleted && listAllowanceExcelData.Any(p => p.CodeTblSalary.Equals(x.CodeTblSalary) && p.AllowanceCode.Equals(x.AllowanceCode) && p.EmployeeCode.Equals(x.EmployeeCode)));
                            if (listAllowanceDataBefore.Count() > 0)
                                _context.SalaryTableAllowances.RemoveRange(listAllowanceDataBefore);

                            _context.SalaryTableAllowances.Load();
                            var listAllowanceData = listAllowanceExcelData.Where(x => !x.IsDeleted && !_context.SalaryTableAllowances.Local.Any(p => p.CodeTblSalary.Equals(x.CodeTblSalary) && p.AllowanceCode.Equals(x.AllowanceCode) && p.EmployeeCode.Equals(x.EmployeeCode)));
                            if (listAllowanceData.Count() > 0)
                                _context.SalaryTableAllowances.AddRange(listAllowanceData);

                            _context.SaveChanges();
                        }
                    }
                }
            }
            catch (Exception e)
            {
            }
            return Json(list);
        }


        [NonAction]
        public string CreateFileOld(List<ExcelSalary> list, int month, int year)
        {
            ExcelEngine excelEngine = new ExcelEngine();
            IApplication application = excelEngine.Excel;
            application.DefaultVersion = ExcelVersion.Excel2016;
            IWorkbook workbook = application.Workbooks.Create(1);
            workbook.Version = ExcelVersion.Excel2010;
            IWorksheet sheetRequest = workbook.Worksheets.Create("Bảng lương");
            workbook.Worksheets[0].Remove();
            IMigrantRange migrantRange = workbook.Worksheets[0].MigrantRange;

            workbook.SetSeparators(';', ';');

            sheetRequest.Range["A1:A2"].Merge(true);
            sheetRequest.Range["A1"].Text = "STT";

            sheetRequest.Range["B1:B2"].Merge(true);
            sheetRequest.Range["B1"].Text = "Họ tên";
            sheetRequest.Range["B1"].HorizontalAlignment = ExcelHAlign.HAlignCenter;
            sheetRequest.Range["B1"].CellStyle.Font.Bold = true;
            sheetRequest.Range["B1"].ColumnWidth = 200;

            sheetRequest.Range["C1:C2"].Merge(true);
            sheetRequest.Range["C1"].Text = "Chức vụ";
            sheetRequest.Range["C1"].HorizontalAlignment = ExcelHAlign.HAlignCenter;
            sheetRequest.Range["C1"].CellStyle.Font.Bold = true;

            sheetRequest.Range["D1:D2"].Merge(true);
            sheetRequest.Range["D1"].Text = "Lương chính";
            sheetRequest.Range["D1"].HorizontalAlignment = ExcelHAlign.HAlignCenter;
            sheetRequest.Range["D1"].CellStyle.Font.Bold = true;

            sheetRequest.Range["E1:H1"].Merge(true);
            sheetRequest.Range["E1"].Text = "Phụ cấp";
            sheetRequest.Range["E1"].HorizontalAlignment = ExcelHAlign.HAlignCenter;
            sheetRequest.Range["E1"].CellStyle.Font.Bold = true;

            sheetRequest.Range["E2"].Text = "Trách nhiệm";
            sheetRequest.Range["F2"].Text = "Ăn trưa";
            sheetRequest.Range["G2"].Text = "Điện thoại";
            sheetRequest.Range["H2"].Text = "Xăng xe";

            sheetRequest.Range["I1:I2"].Merge(true);
            sheetRequest.Range["I1"].Text = "Tổng thu nhập";
            sheetRequest.Range["I1"].CellStyle.Font.Bold = true;

            sheetRequest.Range["J1:J2"].Merge(true);
            sheetRequest.Range["J1"].Text = "Ngày công";
            sheetRequest.Range["J1"].CellStyle.Font.Bold = true;

            sheetRequest.Range["K1:K2"].Merge(true);
            sheetRequest.Range["K1"].Text = "Tổng lương thực tế";
            sheetRequest.Range["K1"].CellStyle.Font.Bold = true;

            sheetRequest.Range["L1:L2"].Merge(true);
            sheetRequest.Range["L1"].Text = "Lương đóng BH";
            sheetRequest.Range["L1"].CellStyle.Font.Bold = true;

            sheetRequest.Range["M1:Q1"].Merge(true);
            sheetRequest.Range["M1"].Text = "Trích vào Chi phí Doanh nghiệp";
            sheetRequest.Range["M1"].HorizontalAlignment = ExcelHAlign.HAlignCenter;
            sheetRequest.Range["M1"].CellStyle.Font.Bold = true;

            sheetRequest.Range["M2"].Text = "KPCĐ(2%)";
            sheetRequest.Range["N2"].Text = "BHXH(17,5%)";
            sheetRequest.Range["O2"].Text = "BHYT(3%)";
            sheetRequest.Range["P2"].Text = "BHTN(1%)";
            sheetRequest.Range["Q2"].Text = "Cộng(23,5%)";
            sheetRequest.Range["Q2"].CellStyle.Font.Bold = true;

            sheetRequest.Range["R1:U1"].Merge(true);
            sheetRequest.Range["R1"].Text = "Trích vào Lương nhân viên";
            sheetRequest.Range["R1"].HorizontalAlignment = ExcelHAlign.HAlignCenter;
            sheetRequest.Range["R1"].CellStyle.Font.Bold = true;

            sheetRequest.Range["R2"].Text = "BHXH(8%)";
            sheetRequest.Range["S2"].Text = "BHYT(1,5%)";
            sheetRequest.Range["T2"].Text = "BHTN(1%)";
            sheetRequest.Range["U2"].Text = "Cộng(10,5%)";
            sheetRequest.Range["U2"].CellStyle.Font.Bold = true;

            sheetRequest.Range["V1:V2"].Merge(true);
            sheetRequest.Range["V1"].Text = "Thuế TNCN";
            sheetRequest.Range["V1"].CellStyle.Font.Bold = true;

            sheetRequest.Range["W1:W2"].Merge(true);
            sheetRequest.Range["W1"].Text = "Tạm ứng";
            sheetRequest.Range["W1"].CellStyle.Font.Bold = true;

            sheetRequest.Range["X1:X2"].Merge(true);
            sheetRequest.Range["X1"].Text = "Thực lĩnh";
            sheetRequest.Range["X1"].CellStyle.Font.Bold = true;

            sheetRequest.Range["Y1:Y2"].Merge(true);
            sheetRequest.Range["Y1"].Text = "Ghi chú";
            sheetRequest.Range["Y1"].CellStyle.Font.Bold = true;

            sheetRequest.Range["C3"].Text = "1";
            sheetRequest.Range["C3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["D3"].Text = "2";
            sheetRequest.Range["D3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["E3"].Text = "3";
            sheetRequest.Range["E3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["F3"].Text = "4";
            sheetRequest.Range["F3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["G3"].Text = "5";
            sheetRequest.Range["G3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["H3"].Text = "6";
            sheetRequest.Range["H3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["I3"].Text = "7";
            sheetRequest.Range["I3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["J3"].Text = "8";
            sheetRequest.Range["J3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["K3"].Text = "9";
            sheetRequest.Range["K3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["L3"].Text = "10";
            sheetRequest.Range["L3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["M3"].Text = "11";
            sheetRequest.Range["M3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["N3"].Text = "12";
            sheetRequest.Range["N3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["O3"].Text = "13";
            sheetRequest.Range["O3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["P3"].Text = "14";
            sheetRequest.Range["P3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["Q3"].Text = "15";
            sheetRequest.Range["Q3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["R3"].Text = "16";
            sheetRequest.Range["R3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["S3"].Text = "17";
            sheetRequest.Range["S3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["T3"].Text = "18";
            sheetRequest.Range["T3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["U3"].Text = "19";
            sheetRequest.Range["U3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["V3"].Text = "20";
            sheetRequest.Range["V3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["W3"].Text = "21";
            sheetRequest.Range["W3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["X3"].Text = "22";
            sheetRequest.Range["X3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            IStyle tableHeader = workbook.Styles.Add("TableHeaderStyle");
            tableHeader.Font.Color = ExcelKnownColors.Black;
            tableHeader.Font.Size = 11;
            tableHeader.Font.FontName = "Calibri";
            tableHeader.HorizontalAlignment = ExcelHAlign.HAlignCenter;
            tableHeader.VerticalAlignment = ExcelVAlign.VAlignCenter;
            tableHeader.Color = Color.FromArgb(0, 165, 215, 213);
            tableHeader.Borders[ExcelBordersIndex.EdgeLeft].LineStyle = ExcelLineStyle.Thin;
            tableHeader.Borders[ExcelBordersIndex.EdgeRight].LineStyle = ExcelLineStyle.Thin;
            tableHeader.Borders[ExcelBordersIndex.EdgeTop].LineStyle = ExcelLineStyle.Thin;
            tableHeader.Borders[ExcelBordersIndex.EdgeBottom].LineStyle = ExcelLineStyle.Thin;
            sheetRequest.UsedRange.AutofitColumns();
            sheetRequest["A1:Y3"].CellStyle = tableHeader;

            var row = 4;
            var index = 1;
            foreach (var item in list)
            {
                sheetRequest.Range["A" + row].Text = index < 10 ? "0" + index : index.ToString();
                sheetRequest.Range["A" + row].HorizontalAlignment = ExcelHAlign.HAlignCenter;

                sheetRequest.Range["B" + row].Text = item.FullName;
                sheetRequest.Range["B" + row].HorizontalAlignment = ExcelHAlign.HAlignLeft;

                sheetRequest.Range["C" + row].Text = item.Position;
                sheetRequest.Range["C" + row].HorizontalAlignment = ExcelHAlign.HAlignLeft;

                sheetRequest.Range["D" + row].Text = item.Salary.ToString();
                sheetRequest.Range["D" + row].HorizontalAlignment = ExcelHAlign.HAlignRight;

                sheetRequest.Range["J" + row].Text = item.TimeWorking.ToString();
                sheetRequest.Range["J" + row].HorizontalAlignment = ExcelHAlign.HAlignRight;

                sheetRequest.Range["I" + row].Formula = "=SUBTOTAl(9,D" + row + ":H" + row + ")";//Tổng thu nhập (E)
                sheetRequest.Range["K" + row].Formula = string.Format("=I{0}/26*J{1}", row, row);//Tổng thu nhập thực tế (G)
                sheetRequest.Range["L" + row].Formula = string.Format("=D{0}+E{1}", row, row);//Lương đóng bảo hiểm (H)
                sheetRequest.Range["M" + row].Formula = string.Format("=$L{0}*2/100", row);//KPCĐ (Doanh nghiệp)(I)
                sheetRequest.Range["N" + row].Formula = string.Format("=$L{0}*17;5/100", row);//BHXH (Doanh nghiệp)(J)
                sheetRequest.Range["O" + row].Formula = string.Format("=$L{0}*3/100", row);//BHYT (Doanh nghiệp)(K)
                sheetRequest.Range["P" + row].Formula = string.Format("=$L{0}*1/100", row);//BHTN (Doanh nghiệp)(L)
                sheetRequest.Range["Q" + row].Formula = string.Format("=SUBTOTAL(9, M{0}:P{1})", row, row);//Cộng 23.5% (Doanh nghiệp)(M)
                sheetRequest.Range["R" + row].Formula = string.Format("=$L{0}*8/100", row);//BHXH (Nhân viên)(N)
                sheetRequest.Range["S" + row].Formula = string.Format("=$L{0}*1;5/100", row);//BHYT (Nhân viên)(O)
                sheetRequest.Range["T" + row].Formula = string.Format("=$L{0}*1/100", row);//BHTN (Nhân viên)(P)
                sheetRequest.Range["U" + row].Formula = string.Format("=SUBTOTAL(9, R{0}:T{1})", row, row);//Cộng 10,5% (Nhân viên)(Q)

                sheetRequest.Range["X" + row].Formula = string.Format("=K{0}-U{1}-V{2}-W{3})", row, row, row, row);//Thực lĩnh(T)
                row++;
                index++;
            }
            //string ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            var fileName = "Bảng lương tháng " + month + " năm " + year + ".xlsx";
            MemoryStream ms = new MemoryStream();
            workbook.SaveAs(ms);
            workbook.Close();
            excelEngine.Dispose();
            ms.Position = 0;
            JMessage msg1 = _upload.UploadFileByBytes(ms.GetBuffer(), fileName, _hostingEnvironment.WebRootPath, "uploads\\tempFile");
            string path = msg1.Object.ToString();
            return path;
        }

        [NonAction]
        public string CreateFile(List<ExcelSalary> list, int month, int year)
        {
            ExcelEngine excelEngine = new ExcelEngine();
            IApplication application = excelEngine.Excel;
            application.DefaultVersion = ExcelVersion.Excel2016;
            IWorkbook workbook = application.Workbooks.Create(1);
            workbook.Version = ExcelVersion.Excel2010;
            IWorksheet sheetRequest = workbook.Worksheets.Create("Bảng lương");
            workbook.Worksheets[0].Remove();
            IMigrantRange migrantRange = workbook.Worksheets[0].MigrantRange;

            workbook.SetSeparators(';', ',');

            sheetRequest.Range["A1:A2"].Merge(true);
            sheetRequest.Range["A1"].Text = "STT";

            sheetRequest.Range["B1:B2"].Merge(true);
            sheetRequest.Range["B1"].Text = "Họ tên";
            sheetRequest.Range["B1"].HorizontalAlignment = ExcelHAlign.HAlignCenter;
            sheetRequest.Range["B1"].CellStyle.Font.Bold = true;


            sheetRequest.Range["C1:C2"].Merge(true);
            sheetRequest.Range["C1"].Text = "Chức vụ";
            sheetRequest.Range["C1"].HorizontalAlignment = ExcelHAlign.HAlignCenter;
            sheetRequest.Range["C1"].CellStyle.Font.Bold = true;

            sheetRequest.Range["D1:D2"].Merge(true);
            sheetRequest.Range["D1"].Text = "Lương chính";
            sheetRequest.Range["D1"].HorizontalAlignment = ExcelHAlign.HAlignCenter;
            sheetRequest.Range["D1"].CellStyle.Font.Bold = true;

            sheetRequest.Range["E1:E2"].Merge(true);
            sheetRequest.Range["E1"].Text = "Tổng thu nhập";
            sheetRequest.Range["E1"].CellStyle.Font.Bold = true;

            sheetRequest.Range["F1:F2"].Merge(true);
            sheetRequest.Range["F1"].Text = "Ngày công";
            sheetRequest.Range["F1"].CellStyle.Font.Bold = true;

            sheetRequest.Range["G1:G2"].Merge(true);
            sheetRequest.Range["G1"].Text = "Tổng lương thực tế";
            sheetRequest.Range["G1"].CellStyle.Font.Bold = true;

            sheetRequest.Range["H1:H2"].Merge(true);
            sheetRequest.Range["H1"].Text = "Lương đóng BH";
            sheetRequest.Range["H1"].CellStyle.Font.Bold = true;

            sheetRequest.Range["I1:M1"].Merge(true);
            sheetRequest.Range["I1"].Text = "Trích vào Chi phí Doanh nghiệp";
            sheetRequest.Range["I1"].HorizontalAlignment = ExcelHAlign.HAlignCenter;
            sheetRequest.Range["I1"].CellStyle.Font.Bold = true;

            sheetRequest.Range["I2"].Text = "KPCĐ(2%)";
            sheetRequest.Range["J2"].Text = "BHXH(17,5%)";
            sheetRequest.Range["K2"].Text = "BHYT(3%)";
            sheetRequest.Range["L2"].Text = "BHTN(1%)";
            sheetRequest.Range["M2"].Text = "Cộng(23,5%)";
            sheetRequest.Range["N2"].CellStyle.Font.Bold = true;

            sheetRequest.Range["N1:Q1"].Merge(true);
            sheetRequest.Range["N1"].Text = "Trích vào Lương nhân viên";
            sheetRequest.Range["N1"].HorizontalAlignment = ExcelHAlign.HAlignCenter;
            sheetRequest.Range["N1"].CellStyle.Font.Bold = true;

            sheetRequest.Range["N2"].Text = "BHXH(8%)";
            sheetRequest.Range["O2"].Text = "BHYT(1,5%)";
            sheetRequest.Range["P2"].Text = "BHTN(1%)";
            sheetRequest.Range["Q2"].Text = "Cộng(10,5%)";
            sheetRequest.Range["R2"].CellStyle.Font.Bold = true;

            sheetRequest.Range["R1:R2"].Merge(true);
            sheetRequest.Range["R1"].Text = "Thuế TNCN";
            sheetRequest.Range["R1"].CellStyle.Font.Bold = true;

            sheetRequest.Range["S1:S2"].Merge(true);
            sheetRequest.Range["S1"].Text = "Tạm ứng";
            sheetRequest.Range["S1"].CellStyle.Font.Bold = true;

            sheetRequest.Range["T1:T2"].Merge(true);
            sheetRequest.Range["T1"].Text = "Thực lĩnh";
            sheetRequest.Range["T1"].CellStyle.Font.Bold = true;

            sheetRequest.Range["U1:U2"].Merge(true);
            sheetRequest.Range["U1"].Text = "Hệ số lương";
            sheetRequest.Range["U1"].CellStyle.Font.Bold = true;

            sheetRequest.Range["C3"].Text = "1";
            sheetRequest.Range["C3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["D3"].Text = "2";
            sheetRequest.Range["D3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["E3"].Text = "3";
            sheetRequest.Range["E3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["F3"].Text = "4";
            sheetRequest.Range["F3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["G3"].Text = "5";
            sheetRequest.Range["G3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["H3"].Text = "6";
            sheetRequest.Range["H3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["I3"].Text = "7";
            sheetRequest.Range["I3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["J3"].Text = "8";
            sheetRequest.Range["J3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["K3"].Text = "9";
            sheetRequest.Range["K3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["L3"].Text = "10";
            sheetRequest.Range["L3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["M3"].Text = "11";
            sheetRequest.Range["M3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["N3"].Text = "12";
            sheetRequest.Range["N3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["O3"].Text = "13";
            sheetRequest.Range["O3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["P3"].Text = "14";
            sheetRequest.Range["P3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["Q3"].Text = "15";
            sheetRequest.Range["Q3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["R3"].Text = "16";
            sheetRequest.Range["R3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["S3"].Text = "17";
            sheetRequest.Range["S3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["T3"].Text = "18";
            sheetRequest.Range["T3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["U3"].Text = "19";
            sheetRequest.Range["U3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            string[] excelColums = { "V", "W", "X", "Y", "Z", "AA", "AB", "AC", "AD", "AE" };//Các cột phụ cấp
            var listAllowance = _context.AttributeManagers.Where(x => !x.IsDeleted && x.Group.Equals("ATTR_GROUP_ALLOWANCE")).ToList();//Lấy danh sách phụ cấp
            var columRangeTo = "Y3";
            var columRangeEnd = "Y3";
            var columRangeFromTo = "";
            if (listAllowance.Count > 0)
            {
                var columFrom = excelColums[0] + 1;
                var columTo = excelColums[listAllowance.Count - 1] + 1;
                var columRange = string.Format("{0}:{1}", columFrom, columTo);
                columRangeTo = excelColums[listAllowance.Count - 1] + 3;
                columRangeEnd = excelColums[listAllowance.Count - 1] + (list.Count + 3);
                sheetRequest.Range[columRange].Merge(true);
                sheetRequest.Range[columFrom].Text = "Phụ cấp";
                sheetRequest.Range[columFrom].HorizontalAlignment = ExcelHAlign.HAlignCenter;
                sheetRequest.Range[columFrom].CellStyle.Font.Bold = true;
            }

            for (int i = 0; i < listAllowance.Count; i++)
            {
                var columFrom = excelColums[i] + 2;
                sheetRequest.Range[columFrom].Text = listAllowance[i].Name;

                var columNumber = excelColums[i] + 3;
                sheetRequest.Range[columNumber].Text = (20 + i).ToString();
                sheetRequest.Range[columNumber].HorizontalAlignment = ExcelHAlign.HAlignCenter;
            }

            IStyle tableHeader = workbook.Styles.Add("TableHeaderStyle");
            tableHeader.Font.Color = ExcelKnownColors.Black;
            tableHeader.Font.Size = 11;
            tableHeader.Font.FontName = "Calibri";
            tableHeader.Font.Bold = true;
            tableHeader.HorizontalAlignment = ExcelHAlign.HAlignCenter;
            tableHeader.VerticalAlignment = ExcelVAlign.VAlignCenter;
            tableHeader.Color = Color.FromArgb(0, 165, 215, 213);
            tableHeader.Borders[ExcelBordersIndex.EdgeLeft].LineStyle = ExcelLineStyle.Thin;
            tableHeader.Borders[ExcelBordersIndex.EdgeRight].LineStyle = ExcelLineStyle.Thin;
            tableHeader.Borders[ExcelBordersIndex.EdgeTop].LineStyle = ExcelLineStyle.Thin;
            tableHeader.Borders[ExcelBordersIndex.EdgeBottom].LineStyle = ExcelLineStyle.Thin;
            sheetRequest.UsedRange.AutofitColumns();
            sheetRequest["A1:" + columRangeTo].CellStyle = tableHeader;

            sheetRequest["A4:" + columRangeEnd].CellStyle.Borders[ExcelBordersIndex.EdgeLeft].LineStyle = ExcelLineStyle.Thin;
            sheetRequest["A4:" + columRangeEnd].CellStyle.Borders[ExcelBordersIndex.EdgeRight].LineStyle = ExcelLineStyle.Thin;
            sheetRequest["A4:" + columRangeEnd].CellStyle.Borders[ExcelBordersIndex.EdgeTop].LineStyle = ExcelLineStyle.Thin;
            sheetRequest["A4:" + columRangeEnd].CellStyle.Borders[ExcelBordersIndex.EdgeBottom].LineStyle = ExcelLineStyle.Thin;

            sheetRequest.Range["B1"].ColumnWidth = 25;
            sheetRequest.Range["C1"].ColumnWidth = 25;

            sheetRequest.Range["I4:Q" + (list.Count + 3)].CellStyle.Color = Color.FromArgb(0, 242, 229, 109);

            var row = 4;
            var index = 1;
            foreach (var item in list)
            {
                columRangeFromTo = string.Empty;
                sheetRequest.Range["A" + row].Text = index < 10 ? "0" + index : index.ToString();
                sheetRequest.Range["A" + row].HorizontalAlignment = ExcelHAlign.HAlignCenter;

                sheetRequest.Range["B" + row].Text = item.FullName;
                sheetRequest.Range["B" + row].HorizontalAlignment = ExcelHAlign.HAlignLeft;

                sheetRequest.Range["C" + row].Text = item.Position;
                sheetRequest.Range["C" + row].HorizontalAlignment = ExcelHAlign.HAlignLeft;

                sheetRequest.Range["D" + row].Text = item.Salary.ToString();
                sheetRequest.Range["D" + row].HorizontalAlignment = ExcelHAlign.HAlignRight;


                sheetRequest.Range["F" + row].Text = item.TimeWorking.ToString();
                sheetRequest.Range["F" + row].HorizontalAlignment = ExcelHAlign.HAlignRight;

                sheetRequest.Range["R" + row].Text = "0";
                sheetRequest.Range["R" + row].HorizontalAlignment = ExcelHAlign.HAlignRight;

                sheetRequest.Range["S" + row].Text = "0";
                sheetRequest.Range["S" + row].HorizontalAlignment = ExcelHAlign.HAlignRight;

                sheetRequest.Range["U" + row].Text = item.SalaryRatio;
                sheetRequest.Range["U" + row].HorizontalAlignment = ExcelHAlign.HAlignRight;

                //Format chữ in đậm
                sheetRequest.Range["G" + row].CellStyle.Font.Bold = true;
                sheetRequest.Range["H" + row].CellStyle.Font.Bold = true;
                sheetRequest.Range["T" + row].CellStyle.Font.Bold = true;

                //Format Currency
                sheetRequest.Range["D" + row].NumberFormat = "#,#";
                sheetRequest.Range["E" + row].NumberFormat = "#,#";
                sheetRequest.Range["G" + row].NumberFormat = "#,#";
                sheetRequest.Range["H" + row].NumberFormat = "#,#";
                sheetRequest.Range[string.Format("I{0}:T{1}", row, row)].NumberFormat = "#,#";
                sheetRequest.Range[string.Format("V{0}:AE{1}", row, row)].NumberFormat = "#,#";

                for (int i = 0; i < listAllowance.Count; i++)
                {
                    columRangeFromTo += string.Format("+{0}{1}", excelColums[i], row);
                }
                //Lắp các công thức tính
                //sheetRequest.Range["E" + row].Formula = "=SUBTOTAl(9,D" + row + "," + columRangeFromTo + ")";//Tổng thu nhập (E)
                sheetRequest.Range["E" + row].Formula = "=D" + row + "*U" + row + columRangeFromTo + ")";//Tổng thu nhập (E)
                sheetRequest.Range["G" + row].Formula = string.Format("=E{0}/26*F{1}", row, row);//Tổng thu nhập thực tế (G)
                sheetRequest.Range["H" + row].Formula = string.Format("=D{0}*U{1}+V{2}", row, row, row);//Lương đóng bảo hiểm (H) = Lương chính + Phụ cấp trách nhiệm (Cột V)
                sheetRequest.Range["I" + row].Formula = string.Format("=H{0}*2/100", row);//KPCĐ (Doanh nghiệp)(I)
                sheetRequest.Range["J" + row].Formula = string.Format("=H{0}*(175/1000)", row);//BHXH (Doanh nghiệp)(J)
                sheetRequest.Range["K" + row].Formula = string.Format("=H{0}*3/100", row);//BHYT (Doanh nghiệp)(K)
                sheetRequest.Range["L" + row].Formula = string.Format("=H{0}*1/100", row);//BHTN (Doanh nghiệp)(L)
                sheetRequest.Range["M" + row].Formula = string.Format("=H{0}*(235/1000)", row);//Cộng 23.5% (Doanh nghiệp)(M)
                sheetRequest.Range["N" + row].Formula = string.Format("=H{0}*8/100", row);//BHXH (Nhân viên)(N)
                sheetRequest.Range["O" + row].Formula = string.Format("=H{0}*(15/1000)", row);//BHYT (Nhân viên)(O)
                sheetRequest.Range["P" + row].Formula = string.Format("=H{0}*1/100", row);//BHTN (Nhân viên)(P)
                sheetRequest.Range["Q" + row].Formula = string.Format("=H{0}*(105/1000)", row, row);//Cộng 10,5% (Nhân viên)(Q)

                sheetRequest.Range["T" + row].Formula = string.Format("=G{0}-Q{1}-R{2}-S{3})", row, row, row, row);//Thực lĩnh(T)

                row++;
                index++;
            }
            //string ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            var fileName = "Bảng lương tháng " + month + " năm " + year + ".xlsx";
            MemoryStream ms = new MemoryStream();
            workbook.SaveAs(ms);
            workbook.Close();
            excelEngine.Dispose();
            ms.Position = 0;
            JMessage msg1 = _upload.UploadFileByBytes(ms.GetBuffer(), fileName, _hostingEnvironment.WebRootPath, "uploads\\tempFile");
            string path = msg1.Object.ToString();
            return path;
        }


        [NonAction]
        public List<TimeWorkingSheet> TimeWorkKing(int month, int year, string userName)
        {
            var listDateInMonth = DateTimeExtensions.GetDates(year, month);
            var query = (from a in _context.ShiftLogs
                         where (string.IsNullOrEmpty(userName) || a.CreatedBy.Equals(userName))
                          && (a.ChkinTime.Value.Date >= listDateInMonth[0].Date)
                         && (a.ChkoutTime.HasValue ? a.ChkoutTime.Value.Date : DateTime.Now.Date) <= listDateInMonth[listDateInMonth.Count() - 1].Date
                         select new
                         {
                             a.Id,
                             a.ShiftCode,
                             a.CreatedBy,
                             a.ChkinTime,
                             a.ChkoutTime
                         }).GroupBy(x => x.CreatedBy);
            var listTimeWorking = new List<TimeWorkingSheet>();
            if (query.Any())
            {
                foreach (var item in query)
                {
                    double timeWorking = 0;
                    var timeSheet = new TimeWorkingSheet();
                    var sessionUser = item.DistinctBy(x => x.ShiftCode).ToList();
                    foreach (var session in sessionUser)
                    {
                        if (session.ChkoutTime.HasValue)
                        {
                            timeWorking += session.ChkoutTime.Value.Subtract(session.ChkinTime.Value).TotalSeconds;
                        }
                    }

                    double days = timeWorking / (8 * 3600);
                    days = Math.Round(days * 2, MidpointRounding.AwayFromZero) / 2;
                    timeSheet.ID = item.First().Id;
                    timeSheet.UserName = item.First().CreatedBy;
                    timeSheet.TimeWorking = days;
                    listTimeWorking.Add(timeSheet);
                }
            }
            return listTimeWorking;
        }
        public class ExcelSalary
        {
            public string FullName { get; set; }
            public double? Salary { get; set; }
            public string Position { get; set; }
            public double? TimeWorking { get; set; }
            public string SalaryRatio { get; set; }
        }
        public class TimeWorkingSheet
        {
            public int ID { get; set; }
            public string UserName { get; set; }
            public double? TimeWorking { get; set; }
        }
        #endregion

        #region Salary table header

        #endregion

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }).Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion

        #region Object Read Excel

        public class ExcelSalaryModel
        {
            public List<SalaryTableAllowance> ListSalaryAllowance { get; set; }
            public SalaryTableDetail SalaryTableDetail { get; set; }
        }

        #endregion
    }
}