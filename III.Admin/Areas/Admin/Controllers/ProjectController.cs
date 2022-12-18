using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using Microsoft.AspNetCore.Http;
using System.Globalization;
using System.IO;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore.Internal;
using III.Domain.Enums;
using System.Net;
using System.Threading.Tasks;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class ProjectController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private static AsyncLocker<string> userLock = new AsyncLocker<string>();
        private readonly IStringLocalizer<ProjectController> _stringLocalizer;
        private readonly IStringLocalizer<CustomerController> _customerLocalizer;
        private readonly IStringLocalizer<SupplierController> _supplierLocalizer;
        private readonly IStringLocalizer<CardJobController> _cardJobController;
        private readonly IStringLocalizer<FileObjectShareController> _fileObjectShareController;
        private readonly IStringLocalizer<AttributeManagerController> _attributeManagerController;
        private readonly IStringLocalizer<MaterialProductController> _materialProductController;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly ICardJobService _cardService;
        public ProjectController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment,
            IStringLocalizer<ProjectController> stringLocalizer, IStringLocalizer<CustomerController> customerLocalizer,
            IStringLocalizer<SupplierController> supplierLocalizer, IStringLocalizer<CardJobController> cardJobController,
            IStringLocalizer<AttributeManagerController> attributeManagerController, IStringLocalizer<MaterialProductController> materialProductController,
            IStringLocalizer<SharedResources> sharedResources, ICardJobService cardService, IStringLocalizer<FileObjectShareController> fileObjectShareController)
        {
            _context = context;
            _upload = upload;
            _hostingEnvironment = hostingEnvironment;
            _stringLocalizer = stringLocalizer;
            _customerLocalizer = customerLocalizer;
            _supplierLocalizer = supplierLocalizer;
            _cardJobController = cardJobController;
            _sharedResources = sharedResources;
            _cardService = cardService;
            _fileObjectShareController = fileObjectShareController;
            _attributeManagerController = attributeManagerController;
            _materialProductController = materialProductController;
        }
        public IActionResult Index()
        {
            return View();
        }

        #region GetComboboxValue


        [HttpPost]
        public object GetItemCustomers(int id)
        {
            var a = _context.Projects.FirstOrDefault(m => m.Id == id);
            return Json(a);
            //var data = _context.Customerss.Where(x=>x.CusID==id).Select(x => new { Code = x.CusCode }).ToList();
            //return Json(data);
        }

        [HttpPost]
        public object GetProjectUnit()
        {
            var data = GetCurrencyBase();
            return Json(data);
        }

        //[HttpPost]
        //public object GetProjectLanguage()
        //{
        //    return _context.CommonSettings.Where(x => x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.ProgramLanguage)).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
        //}

        [HttpPost]
        public object GetProjectType()
        {
            return _context.CommonSettings.Where(x => x.Group == EnumHelper<ProjectEnum>.GetDisplayValue(ProjectEnum.ProType)).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
        }

        [HttpPost]
        public object GetBoard()
        {
            return _context.WORKOSBoards.Where(x => !x.IsDeleted).Select(x => new { Code = x.BoardCode, Name = x.BoardName });
        }


        [HttpPost]
        public object GetListUser()
        {
            var query = _context.Users.Where(x => x.Active && x.UserName != "admin").Select(x => new { Code = x.Id, Name = x.GivenName }).AsNoTracking().ToList();
            return query;
        }

        [HttpPost]
        public object GetListProject()
        {
            var query = _context.Projects.Where(x => !x.FlagDeleted).Select(x => new { Code = x.ProjectCode, Name = x.ProjectTitle }).AsNoTracking();
            return query;
        }
        [HttpPost]
        public object GetListCustomers()
        {
            var data = _context.Customerss.Where(x => !x.IsDeleted).OrderByDescending(x => x.CusID).Select(x => new
            {
                Code = x.CusCode,
                Name = x.CusName,
                NameJoin = string.Concat("KH - ", x.CusName),
                Type = EnumHelper<CustomerEnum>.GetDisplayValue(CustomerEnum.Customer)
            });
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetListSupplier()
        {
            var query = _context.Suppliers.Where(x => !x.IsDeleted).Select(x => new
            {
                Code = x.SupCode,
                Name = x.SupName,
                NameJoin = string.Concat("NCC - ", x.SupName),
                Type = EnumHelper<SupplierEnum>.GetDisplayValue(SupplierEnum.Supplier)
            });
            return Json(query);
        }

        [HttpPost]
        public JsonResult GetStatus()
        {
            var data = _context.CommonSettings.Where(x => x.Group == "PROJECT_STATUS" && !x.IsDeleted).OrderBy(x => x.Priority).Select(x => new { Code = x.CodeSet, Name = x.ValueSet, Icon = x.Logo });
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetBranch()
        {
            var data = _context.AdOrganizations.Where(x => x.IsEnabled).Select(x => new { Code = x.OrgAddonCode, Name = x.OrgName });
            return Json(data);
        }
        #endregion

        #region index
        public class Wei
        {
            public decimal WeightNum { get; set; }
            public decimal Completed { get; set; }
        }
        [HttpPost]
        public object JTable([FromBody]JTableModelProject jTablePara)
        {
            var session = HttpContext.GetSessionUser();

            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var fromDate = !string.IsNullOrEmpty(jTablePara.StartTime) ? DateTime.ParseExact(jTablePara.StartTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.EndTime) ? DateTime.ParseExact(jTablePara.EndTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var query = new List<Project>();
            if (jTablePara.QueryOrderBy == "SetPriority")
            {
                query = (from a in _context.Projects
                         join b in _context.Users on a.CreatedBy equals b.UserName
                         where (!a.FlagDeleted)
                         && (string.IsNullOrEmpty(jTablePara.ProjectCode) || (a.ProjectCode.ToLower().Contains(jTablePara.ProjectCode.ToLower())))
                         && (string.IsNullOrEmpty(jTablePara.ProjectTitle) || (a.ProjectTitle.ToLower().Contains(jTablePara.ProjectTitle.ToLower())))
                         && (string.IsNullOrEmpty(jTablePara.ProjectType) || (a.PrjType.Equals(jTablePara.ProjectType)))
                         && (string.IsNullOrEmpty(jTablePara.BranchId) || (b.BranchId.Equals(jTablePara.BranchId)))
                         && (fromDate == null || (a.StartTime >= fromDate))
                         && (toDate == null || (a.EndTime <= toDate))
                         && (jTablePara.BudgetStart == null || (a.Budget >= jTablePara.BudgetStart))
                         && (jTablePara.BudgetEnd == null || (a.Budget <= jTablePara.BudgetEnd))
                         //Điều kiện phân quyền dữ liệu
                         && (session.IsAllData
                         || (!session.IsAllData && session.IsBranch && session.RoleCode.Equals(EnumHelper<Role>.GetDisplayValue(Role.Giamdoc)) && session.ListUserOfBranch.Any(x => x == a.CreatedBy))
                         || (!session.IsAllData && !session.IsBranch && session.IsUser && session.UserName == a.CreatedBy))
                         select a).OrderUsingSortExpression(jTablePara.QueryOrderBy).GroupBy(x => x.SetPriority).SelectMany(grouping => grouping.OrderByDescending(b => b.CreatedTime)).Skip(intBeginFor).Take(jTablePara.Length).ToList();
            }
            else
            {
                query = (from a in _context.Projects
                         join b in _context.Users on a.CreatedBy equals b.UserName
                         where (!a.FlagDeleted)
                         && (string.IsNullOrEmpty(jTablePara.ProjectCode) || (a.ProjectCode.ToLower().Contains(jTablePara.ProjectCode.ToLower())))
                         && (string.IsNullOrEmpty(jTablePara.ProjectTitle) || (a.ProjectTitle.ToLower().Contains(jTablePara.ProjectTitle.ToLower())))
                         && (string.IsNullOrEmpty(jTablePara.ProjectType) || (a.PrjType.Equals(jTablePara.ProjectType)))
                         && (string.IsNullOrEmpty(jTablePara.BranchId) || (b.BranchId.Equals(jTablePara.BranchId)))
                         && (fromDate == null || (a.StartTime >= fromDate))
                         && (toDate == null || (a.EndTime <= toDate))
                         && (jTablePara.BudgetStart == null || (a.Budget >= jTablePara.BudgetStart))
                         && (jTablePara.BudgetEnd == null || (a.Budget <= jTablePara.BudgetEnd))
                         //Điều kiện phân quyền dữ liệu
                         && (session.IsAllData
                         || (!session.IsAllData && session.IsBranch && session.RoleCode.Equals(EnumHelper<Role>.GetDisplayValue(Role.Giamdoc)) && session.ListUserOfBranch.Any(x => x == a.CreatedBy))
                         || (!session.IsAllData && !session.IsBranch && session.IsUser && session.UserName == a.CreatedBy))
                         select a).OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).ToList();
            }
            var count = (from a in _context.Projects
                         where (!a.FlagDeleted)
                         && (string.IsNullOrEmpty(jTablePara.ProjectCode) || (a.ProjectCode.ToLower().Contains(jTablePara.ProjectCode.ToLower())))
                         && (string.IsNullOrEmpty(jTablePara.ProjectTitle) || (a.ProjectTitle.ToLower().Contains(jTablePara.ProjectTitle.ToLower())))
                         && (string.IsNullOrEmpty(jTablePara.ProjectType) || (a.PrjType.Equals(jTablePara.ProjectType)))
                         && (fromDate == null || (a.StartTime >= fromDate))
                         && (toDate == null || (a.EndTime <= toDate))
                         && (jTablePara.BudgetStart == null || (a.Budget >= jTablePara.BudgetStart))
                         && (jTablePara.BudgetEnd == null || (a.Budget <= jTablePara.BudgetEnd))
                         //Điều kiện phân quyền dữ liệu
                         && (session.IsAllData
                         || (!session.IsAllData && session.IsBranch && session.RoleCode.Equals(EnumHelper<Role>.GetDisplayValue(Role.Giamdoc)) && session.ListUserOfBranch.Any(x => x == a.CreatedBy))
                         || (!session.IsAllData && !session.IsBranch && session.IsUser && session.UserName == a.CreatedBy))
                         select a).AsNoTracking().Count();
            var data = query.Select(x => new
            {
                x.Id,
                Code = x.ProjectCode,
                Name = x.ProjectTitle,
                Currency = _context.CommonSettings.FirstOrDefault(y => !y.IsDeleted && y.CodeSet == x.Currency)?.ValueSet,
                x.Budget,
                x.StartTime,
                Progress = _cardService.GetPercentJCObject("PROJECT", x.ProjectCode),
                x.EndTime,
                x.SetPriority,
                x.CustomerCode,
                Status = _context.CommonSettings.FirstOrDefault(y => y.CodeSet == x.Status && !y.IsDeleted)?.ValueSet,
                ExpirationDate = _context.AttributeManagerGalaxys.LastOrDefault(p => p.AttrCode.Equals("NGAY_HET_HAN") && p.ObjCode.Equals(x.ProjectCode)) != null ? _context.AttributeManagerGalaxys.LastOrDefault(p => p.AttrCode.Equals("NGAY_HET_HAN") && p.ObjCode.Equals(x.ProjectCode)).AttrValue : "",
                RenewalDate = _context.AttributeManagerGalaxys.LastOrDefault(p => p.AttrCode.Equals("NGAY_GIA_HAN_TIEP_THEO") && p.ObjCode.Equals(x.ProjectCode)) != null ? _context.AttributeManagerGalaxys.LastOrDefault(p => p.AttrCode.Equals("NGAY_GIA_HAN_TIEP_THEO") && p.ObjCode.Equals(x.ProjectCode)).AttrValue : "",
                PaymentNextDate = _context.AttributeManagerGalaxys.LastOrDefault(p => p.AttrCode.Equals("NGAY_THANH_TOAN_TIEP_THEO") && p.ObjCode.Equals(x.ProjectCode)) != null ? _context.AttributeManagerGalaxys.LastOrDefault(p => p.AttrCode.Equals("NGAY_THANH_TOAN_TIEP_THEO") && p.ObjCode.Equals(x.ProjectCode)).AttrValue : "",
            }).ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "Code", "Name", "Currency", "Progress", "Budget", "StartTime", "EndTime", "Status", "SetPriority", "CustomerCode", "ExpirationDate", "RenewalDate", "PaymentNextDate");
            return Json(jdata);
        }

        [HttpGet]
        public object GetItem(int id)
        {
            var data = _context.Projects.FirstOrDefault(x => !x.FlagDeleted && x.Id == id);
            data.ListUserView += ";" + ESEIM.AppContext.UserId;
            var query = (from a in _context.Projects
                         where a.Id == id
                         select new
                         {
                             a.Id,
                             a.ProjectCode,
                             a.ProjectTitle,
                             a.Currency,
                             a.Budget,
                             a.PrjMode,
                             a.SetPriority,
                             a.CaseWorker,
                             StartTime = a.StartTime.ToString("dd/MM/yyyy"),
                             EndTime = a.EndTime.ToString("dd/MM/yyyy"),
                             a.PrjStatus,
                             a.PrjType,
                             a.GoogleMap,
                             a.Address,
                             a.CustomerCode,
                             a.SupplierCode,
                             a.Status
                         }).First();
            _context.SaveChanges();
            return query;
        }

        [HttpPost]
        public JsonResult Insert([FromBody]ProjectModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var checkExist = _context.Projects.FirstOrDefault(x => x.ProjectCode == obj.ProjectCode && !x.FlagDeleted);
                if (checkExist == null)
                {
                    //add project
                    var budget = !string.IsNullOrEmpty(obj.Budget) ? double.Parse(obj.Budget) : (double?)null;
                    var set = !string.IsNullOrEmpty(obj.SetPriority) ? double.Parse(obj.SetPriority) : (double?)null;
                    var fromto = DateTime.ParseExact(obj.StartTime, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                    var dateto = DateTime.ParseExact(obj.EndTime, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                    var data = new Project()
                    {
                        ProjectCode = obj.ProjectCode,
                        ProjectTitle = obj.ProjectTitle,
                        Budget = budget,
                        Currency = obj.Currency,
                        StartTime = fromto,
                        EndTime = dateto,
                        SetPriority = set,
                        PrjStatus = EnumHelper<ProjectStatusEnum>.GetDisplayValue(ProjectStatusEnum.Active),
                        PrjType = obj.PrjType,
                        GoogleMap = obj.GoogleMap,
                        Address = obj.Address,
                        Status = obj.Status,
                        CustomerCode = obj.CustomerCode,
                        SupplierCode = obj.SupplierCode,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now,
                        ListUserView = ESEIM.AppContext.UserId
                    };
                    _context.Projects.Add(data);
                    _context.SaveChanges();
                    msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_ADD_PROJECT"]);
                    msg.Object = data.Id;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_VALUDE_CODE_EXIST"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_ADD_ERR"]);
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Update([FromBody]ProjectModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                double? budget = !string.IsNullOrEmpty(obj.Budget) ? double.Parse(obj.Budget) : (double?)null;
                double? setPriority = !string.IsNullOrEmpty(obj.SetPriority) ? double.Parse(obj.SetPriority) : (double?)null;
                var fromto = DateTime.ParseExact(obj.StartTime, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                var dateto = DateTime.ParseExact(obj.EndTime, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                var data = _context.Projects.FirstOrDefault(x => x.ProjectCode == obj.ProjectCode && !x.FlagDeleted);
                if (data != null)
                {
                    data.ProjectCode = obj.ProjectCode;
                    data.ProjectTitle = obj.ProjectTitle;
                    data.Budget = budget;
                    data.Currency = obj.Currency;
                    data.StartTime = fromto;
                    data.EndTime = dateto;
                    data.SetPriority = setPriority;
                    data.PrjType = obj.PrjType;
                    data.GoogleMap = obj.GoogleMap;
                    data.Address = obj.Address;
                    data.Status = obj.Status;
                    data.CustomerCode = obj.CustomerCode;
                    data.SupplierCode = obj.SupplierCode;
                    data.UpdatedTime = DateTime.Now;
                    data.UpdatedBy = ESEIM.AppContext.UserName;
                    data.ListUserView = ESEIM.AppContext.UserId;
                    _context.Projects.Update(data);
                    _context.SaveChanges();
                    msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_UPDATE_SUCCESS"]);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_ERRO_UPPDATE"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_ERRO_UPPDATE"]);
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Delete(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.Projects.FirstOrDefault(x => x.Id == id);
                if (data != null)
                {
                    //Check dự án đã được đưa vào Hợp đồng
                    var chkUsingInContract = _context.PoSaleHeaders.Any(x => !x.IsDeleted && x.PrjCode == data.ProjectCode);
                    if (chkUsingInContract)
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["PROJECT_MSG_CAN_NOT_DEL_PRO_CONTRACT"];
                        return Json(msg);
                    }

                    //Check dự án đã được đưa vào YCĐH
                    var chkUsingReqImp = _context.RequestImpProductHeaders.Any(x => !x.IsDeleted && x.ProjectCode == data.ProjectCode);
                    if (chkUsingReqImp)
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["PROJECT_MSG_CAN_NOT_DEL_PRO_RQ_IMP"];
                        return Json(msg);
                    }

                    data.FlagDeleted = true;
                    _context.Projects.Update(data);

                    //Xóa các bảng chi tiết
                    var listProjectCusSups = _context.ProjectCusSups.Where(x => !x.IsDeleted && x.ProjectCode == data.ProjectCode).ToList();
                    listProjectCusSups.ForEach(x => { x.IsDeleted = true; x.DeletedBy = ESEIM.AppContext.UserName; x.DeletedTime = DateTime.Now.Date; });
                    _context.ProjectCusSups.UpdateRange(listProjectCusSups);

                    var listProjectMembers = _context.ProjectMembers.Where(x => !x.FlagDeleted && x.ProjectCode == data.ProjectCode).ToList();
                    listProjectMembers.ForEach(x => { x.FlagDeleted = true; });
                    _context.ProjectMembers.UpdateRange(listProjectMembers);

                    var listProjectProducts = _context.ProjectProducts.Where(x => x.ProjectCode == data.ProjectCode).ToList();
                    _context.ProjectProducts.RemoveRange(listProjectProducts);

                    var listProjectAttributes = _context.ProjectAttributes.Where(x => x.ProjectCode == data.ProjectCode).ToList();
                    _context.ProjectAttributes.RemoveRange(listProjectAttributes);

                    var listEDMSRepoCatFiles = _context.EDMSRepoCatFiles.Where(x => x.ObjectType == EnumHelper<ProjectEnum>.GetDisplayValue(ProjectEnum.Project) && x.ObjectCode == data.ProjectCode).ToList();
                    _context.EDMSRepoCatFiles.RemoveRange(listEDMSRepoCatFiles);

                    var listProjectNotes = _context.ProjectNotes.Where(x => !x.IsDeleted && x.ProjectCode == data.ProjectCode).ToList();
                    listProjectNotes.ForEach(x => { x.IsDeleted = true; x.DeletedBy = ESEIM.AppContext.UserName; x.DeletedTime = DateTime.Now.Date; });
                    _context.ProjectNotes.UpdateRange(listProjectNotes);

                    var listProjectTeams = _context.ProjectTeams.Where(x => x.ProjectCode == data.ProjectCode).ToList();
                    _context.ProjectTeams.RemoveRange(listProjectTeams);

                    _context.SaveChanges();
                    msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_DELETE_SUCCESS"]);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["PROJECT_MSG_NOT_FOUND_PRO"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_ERRO_DELETE"]);
            }
            return Json(msg);
        }


        #endregion

        #region Member
        public class EDMSProjectTabMember
        {
            public string Position { get; set; }
            public int? ProjectId { get; set; }
            public string MemberCode { get; set; }
            public string Member { get; set; }
        }
        [HttpPost]
        public object JTableMember([FromBody]JTableModelProject jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            if (jTablePara.ProjectCode == null)
            {
                var list = new List<object>();
                return JTableHelper.JObjectTable(list, jTablePara.Draw, 0, "Id", "Name", "Position", "Email", "Active");
            }
            var query = from a in _context.ProjectMembers
                        join b in _context.Users on a.MemberCode equals b.Id into b1
                        from b in b1.DefaultIfEmpty()
                        where !a.FlagDeleted && !string.IsNullOrEmpty(a.MemberCode)
                        && (string.IsNullOrEmpty(jTablePara.Fullname) || string.Join(" ", b.GivenName, b.FamilyName, b.MiddleName).ToLower().Contains(jTablePara.Fullname.ToLower()))
                        && (string.IsNullOrEmpty(jTablePara.Position) || a.Position.ToLower().Contains(jTablePara.Position.ToLower()))
                        && (a.ProjectCode == jTablePara.ProjectCode)
                        && (!a.FlagDeleted)
                        select new
                        {
                            a.Id,
                            Name = b != null ? string.Join(" ", b.GivenName, b.FamilyName, b.MiddleName) : null,
                            a.Position,
                            Email = b != null ? b.Email : null,
                            Active = b != null ? b.Active : false,
                        };
            int count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "Name", "Position", "Email", "Active");
            return Json(jdata);
        }

        [HttpPost]
        public JsonResult InsertProjectTabMember([FromBody]EDMSProjectTabMember obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var project = _context.Projects.FirstOrDefault(x => x.Id == obj.ProjectId);
                if (project != null)
                {
                    var checkExistMember = _context.ProjectMembers.FirstOrDefault(x => x.ProjectCode == project.ProjectCode && x.MemberCode == obj.MemberCode && x.FlagDeleted == false);
                    if (checkExistMember == null)
                    {
                        var data = new ProjectMember()
                        {
                            MemberCode = obj.MemberCode,
                            ProjectCode = project.ProjectCode,
                            Position = obj.Position,
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now
                        };
                        _context.ProjectMembers.Add(data);
                        _context.SaveChanges();
                        msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_ADD_MEMBER_SUCCESS"]);
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_VALIDATE_MEMBER_ADD_EXIST"]);
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_VALIDATE_PROJECT_EXIST"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_ERR_ADD_MEMBER_PROJECT"]);
                msg.Object = ex;
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateProjectTabMember([FromBody]EDMSProjectTabMember obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var project = _context.Projects.FirstOrDefault(x => x.Id == obj.ProjectId);
                if (project != null)
                {
                    var data = _context.ProjectMembers.FirstOrDefault(x => x.MemberCode == obj.Member && x.ProjectCode == project.ProjectCode);
                    data.Position = obj.Position;
                    data.MemberCode = obj.MemberCode;
                    data.UpdatedBy = ESEIM.AppContext.UserName;
                    data.UpdatedTime = DateTime.Now;
                    _context.ProjectMembers.Update(data);
                    _context.SaveChanges();
                    msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_UPPDATE_MEMBER_SUCCESS"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_ERR_UPPDATE_MEMBER"]);
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult DeleteProjectTabMember(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.ProjectMembers.FirstOrDefault(x => x.Id == id);
                data.FlagDeleted = true;
                _context.ProjectMembers.Update(data);
                _context.SaveChanges();
                msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_DELETE_MEMBER"]);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_ERRO"]);
            }
            return Json(msg);
        }




        [HttpGet]
        public object GetMember(int id)
        {
            var data = _context.ProjectMembers.FirstOrDefault(x => x.Id == id);
            return Json(data);
        }

        //[HttpPost]
        //public object UpdateExtend([FromBody]SupplierExtend obj)
        //{
        //    var msg = new JMessage();
        //    try
        //    {
        //        obj.updated_time = DateTime.Now.Date;
        //        _context.SupplierExtends.Update(obj);
        //        _context.SaveChanges();
        //        msg.Error = false;
        //        msg.Title = "Cập nhật thành công";
        //        return Json(msg);
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Title = "Có lỗi xảy ra!";
        //        msg.Object = ex;
        //        return Json(msg);
        //    }
        //}


        #endregion

        #region Product
        public class ProductPrice
        {
            public string HeaderCode { get; set; }
            public string ProductCode { get; set; }
            public decimal? PriceCostCatelogue { get; set; }
            public decimal? PriceCostAirline { get; set; }
            public decimal? PriceCostSea { get; set; }
            public decimal? PriceRetailBuild { get; set; }
            public decimal? PriceRetailBuildAirline { get; set; }
            public decimal? PriceRetailBuildSea { get; set; }
            public decimal? PriceRetailNoBuild { get; set; }
            public decimal? PriceRetailNoBuildAirline { get; set; }
            public decimal? PriceRetailNoBuildSea { get; set; }
            public int? Tax { get; set; }
        }
        [HttpPost]
        public object JTableProduct([FromBody]JTableModelProject jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            if (jTablePara.ProjectCode == null)
            {
                var list = new List<object>();
                return JTableHelper.JObjectTable(list, jTablePara.Draw, 0, "Id", "CustomerCode", "CusName", "Address", "Email");
            }
            var query = from a in _context.ProjectProducts
                        join b in _context.CommonSettings on a.Unit equals b.CodeSet into b1
                        from b in b1.DefaultIfEmpty()
                        where a.ProjectCode == jTablePara.ProjectCode
                        select new
                        {
                            a.Id,
                            a.ProductCode,
                            a.Cost,
                            a.Quantity,
                            a.Unit,
                            a.PriceType,
                            a.Tax,
                            a.Note,
                            UnitName = b != null ? b.ValueSet : "",
                            TaxMoney = Math.Round((a.Cost * Convert.ToDecimal(a.Tax) * Convert.ToDecimal(a.Quantity)) / 100)
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "ProductCode", "Cost", "Quantity", "Unit", "PriceType", "Tax", "Note", "UnitName", "TaxMoney");
            return Json(jdata);
        }

        [HttpPost]
        public object GetProduct()
        {
            try
            {
                var currentTime = DateTime.Now;
                var productCost = (from a in _context.ProductCostHeaders.Where(x => x.IsDeleted == false)
                                   join b in _context.ProductCostDetails.Where(x => x.IsDeleted == false) on a.HeaderCode equals b.HeaderCode
                                   where a.EffectiveDate != null && a.ExpiryDate != null &&
                                   a.EffectiveDate.Date <= currentTime.Date && currentTime.Date <= a.ExpiryDate.Date
                                   select new ProductPrice
                                   {
                                       HeaderCode = a.HeaderCode,
                                       ProductCode = b.ProductCode,
                                       PriceCostCatelogue = b.PriceCostCatelogue,
                                       PriceCostAirline = b.PriceCostAirline,
                                       PriceCostSea = b.PriceCostSea,

                                       PriceRetailBuild = b.PriceRetailBuild,
                                       PriceRetailBuildAirline = b.PriceRetailBuildAirline,
                                       PriceRetailBuildSea = b.PriceRetailBuildSea,

                                       PriceRetailNoBuild = b.PriceRetailNoBuild,
                                       PriceRetailNoBuildAirline = b.PriceRetailNoBuildAirline,
                                       PriceRetailNoBuildSea = b.PriceRetailNoBuildSea,
                                       Tax = b.Tax
                                   });
                var query = from a in _context.VProductAllTables
                            join b in productCost on a.ProductCode equals b.ProductCode into b2
                            from b in b2.DefaultIfEmpty()
                            orderby a.ProductType
                            select new ProductPrices
                            {
                                Code = a.ProductCode,
                                Name = a.ProductType == "FINISHED_PRODUCT" ? string.Format("Thành phẩm_{0}-{1}", a.ProductName, a.ProductCode) : a.ProductName,
                                Unit = a.Unit,
                                UnitName = a.UnitName,
                                ProductType = a.ProductType,
                                PriceCostCatelogue = (b != null ? b.PriceCostCatelogue : (a.PriceCostCatelogue)),
                                PriceCostAirline = (b != null ? b.PriceCostAirline : (a.PriceCostAirline)),
                                PriceCostSea = (b != null ? b.PriceCostSea : (a.PriceCostSea)),
                                PriceRetailBuild = (b != null ? b.PriceRetailBuild : (a.PriceRetailBuild)),
                                PriceRetailBuildAirline = (b != null ? b.PriceRetailBuildAirline : (a.PriceRetailBuildAirline)),
                                PriceRetailBuildSea = (b != null ? b.PriceRetailBuildSea : (a.PriceRetailBuildSea)),
                                PriceRetailNoBuild = (b != null ? b.PriceRetailNoBuild : (a.PriceRetailNoBuild)),
                                PriceRetailNoBuildAirline = (b != null ? b.PriceRetailNoBuildAirline : (a.PriceRetailNoBuildAirline)),
                                PriceRetailNoBuildSea = (b != null ? b.PriceRetailNoBuildSea : (a.PriceRetailNoBuildSea)),
                                Tax = (b != null ? b.Tax : (0))
                            };
                return query;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        [HttpGet]
        public List<RequestImpProductDetail> GetListProduct(string projectCode)
        {
            var project = _context.Projects.FirstOrDefault(x => !x.FlagDeleted && x.ProjectCode.Equals(projectCode));

            //var listLogProductDetail = new List<LogProductDetail>();
            var listProductGroup = new List<RequestImpProductDetail>();
            if (project != null)
            {
                //if (!string.IsNullOrEmpty(project.LogProductDetail))
                //    listLogProductDetail.AddRange(JsonConvert.DeserializeObject<List<LogProductDetail>>(project.LogProductDetail));

                //var listProductDetail = listLogProductDetail.Where(x => x.ImpQuantity < 0).GroupBy(p => p.ProductCode).Select(x => new
                //{
                //    x.FirstOrDefault().ProductCode,
                //    x.FirstOrDefault().ContractCode,
                //    Quantity = x.FirstOrDefault().ImpQuantity * -1
                //});
                var listProduct = (from b in _context.ProjectProducts
                                   join e in _context.SubProducts.Where(x => !x.IsDeleted) on b.ProductCode equals e.ProductQrCode into e1
                                   from e2 in e1.DefaultIfEmpty()
                                   join f in _context.MaterialProducts.Where(x => !x.IsDeleted) on b.ProductCode equals f.ProductCode into f1
                                   from f2 in f1.DefaultIfEmpty()
                                   join g in _context.CommonSettings.Where(x => !x.IsDeleted) on b.Unit equals g.CodeSet into g1
                                   from g2 in g1.DefaultIfEmpty()
                                   where b.ProjectCode.Equals(projectCode)
                                   select new RequestImpProductDetail
                                   {
                                       ProductCode = b.ProductCode,
                                       //ProductName = e2 != null ? string.Format("{0}-{1}_{2}", _context.MaterialProducts.FirstOrDefault(p => p.ProductCode.Equals(b.ProductCode)) != null ? _context.MaterialProducts.FirstOrDefault(p => p.ProductCode.Equals(b.ProductCode)).ProductName : null, b.ProductCode, e2.AttributeCode) : f2 != null ? string.Format("Thành phẩm_{0}-{1}", f2.ProductName, f2.ProductCode) : null,
                                       ProductName = e2 != null ? e2.AttributeName : f2 != null ? f2.ProductName : null,
                                       ProductType = b.ProductType,
                                       Quantity = (decimal)b.Quantity,
                                       PoCount = b.Quantity.ToString(),
                                       RateConversion = 1,
                                       RateLoss = 1,
                                       Unit = b.Unit,
                                       UnitName = g2.ValueSet,
                                   }).ToList();

                listProductGroup = listProduct.GroupBy(x => x.ProductCode).Select(p => new RequestImpProductDetail
                {
                    ProductCode = p.LastOrDefault().ProductCode,
                    ProductName = p.LastOrDefault().ProductName,
                    ProductType = p.LastOrDefault().ProductType,
                    Quantity = p.LastOrDefault().Quantity,
                    PoCount = p.LastOrDefault().PoCount,
                    RateConversion = p.LastOrDefault().RateConversion,
                    RateLoss = p.LastOrDefault().RateLoss,
                    Unit = p.LastOrDefault().Unit,
                    UnitName = p.LastOrDefault().UnitName,
                }).ToList();
            }
            return listProductGroup;
        }

        [HttpGet]
        public JsonResult GetPriceOption(string customerCode)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var list = new List<Properties>();
            var check = _context.Customerss.FirstOrDefault(x => x.CusCode == customerCode && !x.IsDeleted);
            if (check != null)
            {
                if (check.Role == EnumHelper<CustomerRoleEnum>.GetDisplayValue(CustomerRoleEnum.Agency))
                {
                    var catelogue = new Properties
                    {
                        Code = EnumHelper<PriceAgency>.GetDisplayValue(PriceAgency.Catelogue),
                        Name = PriceAgency.Catelogue.DescriptionAttr(),
                    };
                    list.Add(catelogue);

                    var airline = new Properties
                    {
                        Code = EnumHelper<PriceAgency>.GetDisplayValue(PriceAgency.Airline),
                        Name = PriceAgency.Airline.DescriptionAttr(),
                    };
                    list.Add(airline);

                    var sea = new Properties
                    {
                        Code = EnumHelper<PriceAgency>.GetDisplayValue(PriceAgency.Sea),
                        Name = PriceAgency.Sea.DescriptionAttr(),
                    };
                    list.Add(sea);
                }
                else
                {
                    var airline = new Properties
                    {
                        Code = EnumHelper<PriceRetail>.GetDisplayValue(PriceRetail.Airline),
                        Name = PriceRetail.Airline.DescriptionAttr(),
                    };
                    list.Add(airline);

                    var buid = new Properties
                    {
                        Code = EnumHelper<PriceRetail>.GetDisplayValue(PriceRetail.Buid),
                        Name = PriceRetail.Buid.DescriptionAttr(),
                    };
                    list.Add(buid);

                    var noBuid = new Properties
                    {
                        Code = EnumHelper<PriceRetail>.GetDisplayValue(PriceRetail.NoBuid),
                        Name = PriceRetail.NoBuid.DescriptionAttr(),
                    };
                    list.Add(noBuid);

                    var noBuidAirline = new Properties
                    {
                        Code = EnumHelper<PriceRetail>.GetDisplayValue(PriceRetail.NoBuidAirline),
                        Name = PriceRetail.NoBuidAirline.DescriptionAttr(),
                    };
                    list.Add(noBuidAirline);

                    var noBuidSea = new Properties
                    {
                        Code = EnumHelper<PriceRetail>.GetDisplayValue(PriceRetail.NoBuidSea),
                        Name = PriceRetail.NoBuidSea.DescriptionAttr(),
                    };
                    list.Add(noBuidSea);

                    var sea = new Properties
                    {
                        Code = EnumHelper<PriceRetail>.GetDisplayValue(PriceRetail.Sea),
                        Name = PriceRetail.Sea.DescriptionAttr(),
                    };
                    list.Add(sea);
                }
                msg.Object = list;
            }
            return Json(msg);
        }

        [HttpPost]
        public async Task<object> InsertProduct([FromBody] ProjectProduct obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                using (await userLock.LockAsync(string.Concat(obj.ProjectCode, obj.ProductCode)))
                {
                    var checkExist = await _context.ProjectProducts.FirstOrDefaultAsync(x => x.ProjectCode == obj.ProjectCode && x.ProductCode == obj.ProductCode);
                    if (checkExist == null)
                    {
                        _context.ProjectProducts.Add(obj);
                        _context.SaveChanges();
                        msg.Title = _stringLocalizer["PROJECT_MSG_ADD_PROD_SUCCESS"];
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["PROJECT_MSG_PROD_EXIST"];
                    }
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
        public object UpdateProduct([FromBody] ProjectProduct obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var product = _context.ProjectProducts.FirstOrDefault(x => x.Id == obj.Id);
                if (product != null)
                {
                    product.Unit = obj.Unit;
                    product.Tax = obj.Tax;
                    product.Cost = obj.Cost;
                    product.Quantity = obj.Quantity;
                    product.PriceType = obj.PriceType;
                    product.Note = obj.Note;
                    _context.ProjectProducts.Update(product);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["PROJECT_MSG_NOT_FOUND_PROD_IN_PRO"];
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
        public JsonResult DeleteProduct(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.ProjectProducts.FirstOrDefault(x => x.Id == id);

                //Check dự án đã được đưa vào YCĐH
                var chkUsingReqImp = (from a in _context.RequestImpProductHeaders.Where(x => !x.IsDeleted && x.ProjectCode == data.ProjectCode)
                                      join b in _context.RequestImpProductDetails.Where(x => !x.IsDeleted && x.ProductCode == data.ProductCode && x.ProductType == data.ProductType) on a.ReqCode equals b.ReqCode
                                      select b.Id).Any();
                if (chkUsingReqImp)
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["PROJECT_MSG_CANNOT_DEL_PROD_IN_RQ_IMP"];
                    return Json(msg);
                }

                _context.ProjectProducts.Remove(data);
                _context.SaveChanges();
                msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
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
        public object GetProductInProject(string projectCode)
        {
            var data = _context.ProjectProducts.Where(x => x.ProjectCode.Equals(projectCode));
            return data;
        }
        #endregion

        #region Service
        [HttpGet]
        public object GetService()
        {
            var list = (from a in _context.ServiceCategorys
                        where a.IsDeleted == false
                        select new
                        {
                            Code = a.ServiceCode,
                            Name = a.ServiceName,
                            Unit = a.Unit,
                            Type = a.ServiceType,
                            ServiceGroup = a.ServiceGroup,

                        });
            return list;

        }


        [HttpGet]
        public object GetServiceLevel()
        {
            return _context.CommonSettings.Where(x => x.Group == EnumHelper<ServiceEnum>.GetDisplayValue(ServiceEnum.ServiceLevel) && x.IsDeleted == false).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
        }

        [HttpGet]
        public object GetServiceDuration()
        {
            var list = new List<Properties>();
            var date = new Properties
            {
                Code = EnumHelper<UnitDuration>.GetDisplayValue(UnitDuration.Date),
                Name = UnitDuration.Date.DescriptionAttr()
            };
            list.Add(date);

            var month = new Properties
            {
                Code = EnumHelper<UnitDuration>.GetDisplayValue(UnitDuration.Month),
                Name = UnitDuration.Month.DescriptionAttr()
            };
            list.Add(month);

            var year = new Properties
            {
                Code = EnumHelper<UnitDuration>.GetDisplayValue(UnitDuration.Year),
                Name = UnitDuration.Year.DescriptionAttr()
            };
            list.Add(year);
            return Json(list);
        }

        [HttpPost]
        public object JTableService([FromBody]JTableModelProject jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            if (jTablePara.ProjectCode == null)
            {
                var list = new List<object>();
                return JTableHelper.JObjectTable(list, jTablePara.Draw, 0, "Id", "CustomerCode", "CusName", "Address", "Email");
            }
            var query = from a in _context.ProjectServices
                        join b in _context.ServiceCategorys on a.ServiceCode equals b.ServiceCode into b1
                        from b in b1.DefaultIfEmpty()
                        join c in _context.CommonSettings on a.Level equals c.CodeSet into c1
                        from c in c1.DefaultIfEmpty()
                        where b.IsDeleted == false && a.ProjectCode == jTablePara.ProjectCode
                        select new
                        {
                            a.Id,
                            a.ServiceCode,
                            ServiceName = (b != null ? b.ServiceName : ""),
                            a.Level,
                            LevelName = (c != null ? c.ValueSet : ""),
                            a.Quantity,
                            a.DurationTime,
                            a.Unit,
                            UnitName = a.Unit == EnumHelper<UnitDuration>.GetDisplayValue(UnitDuration.Date) ? UnitDuration.Date.DescriptionAttr() :
                            a.Unit == EnumHelper<UnitDuration>.GetDisplayValue(UnitDuration.Month) ? UnitDuration.Month.DescriptionAttr() : UnitDuration.Year.DescriptionAttr(),
                            a.Note
                        };
            int count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "ServiceCode", "ServiceName", "Level", "LevelName", "Quantity", "DurationTime", "Unit", "UnitName", "Note");
            return Json(jdata);
        }
        [HttpPost]
        public async Task<JsonResult> InsertService([FromBody] ProjectService obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                using (await userLock.LockAsync(string.Concat(obj.ProjectCode, obj.ServiceCode)))
                {
                    var checkExist = await _context.ProjectServices.FirstOrDefaultAsync(x => x.ProjectCode == obj.ProjectCode && x.ServiceCode == obj.ServiceCode);
                    if (checkExist == null)
                    {
                        _context.ProjectServices.Add(obj);
                        _context.SaveChanges();
                        msg.Title = _stringLocalizer["PROJECT_MSG_ADD_SERVICE_SUCCESS"];
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["PROJECT_MSG_SERVICE_EXIST_IN_PRO"];
                    }
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
        public object UpdateService([FromBody]ProjectService obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var service = _context.ProjectServices.FirstOrDefault(x => x.Id == obj.Id);
                if (service != null)
                {
                    service.Unit = obj.Unit;
                    service.Level = obj.Level;
                    service.Quantity = obj.Quantity;
                    service.DurationTime = obj.DurationTime;
                    service.Unit = obj.Unit;
                    service.Note = obj.Note;
                    _context.ProjectServices.Update(service);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["PROJECT_MSG_SERVICE_NOT_EXIST"];
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
        public JsonResult DeleteService(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.ProjectServices.FirstOrDefault(x => x.Id == id);
                _context.ProjectServices.Remove(data);
                _context.SaveChanges();
                msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }
        #endregion

        #region Attribute
        [HttpPost]
        public object JTableAttribute([FromBody]JTableModelProject jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            if (jTablePara.ProjectCode == null)
            {
                var list = new List<object>();
                return JTableHelper.JObjectTable(list, jTablePara.Draw, 0, "Id", "CustomerCode", "CusName", "Address", "Email");
            }
            var query = from a in _context.ProjectAttributes
                        where a.ProjectCode == jTablePara.ProjectCode
                        && (string.IsNullOrEmpty(jTablePara.AttrCode) || a.AttrCode.ToLower().Contains(jTablePara.AttrCode.ToLower()))
                        && (string.IsNullOrEmpty(jTablePara.AttrValue) || a.AttrValue.ToLower().Contains(jTablePara.AttrValue.ToLower()))
                        select new
                        {
                            a.Id,
                            a.AttrCode,
                            a.AttrValue,
                            a.CreatedTime
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "AttrCode", "AttrValue", "CreatedTime");
            return Json(jdata);
        }

        [HttpPost]
        public JsonResult GetItemProjectTabAttribute([FromBody]int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.ProjectAttributes.FirstOrDefault(x => x.Id == id);
                if (data != null)
                {
                    msg.Object = data;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_EXIST_ATRIBUTE"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_ERRO_ADD_ATRIBUTE"]);
            }
            return Json(msg);
        }


        [HttpPost]
        public JsonResult InsertProjectTabAttribute([FromBody]ProjectAttribute obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var checkExist = _context.ProjectAttributes.FirstOrDefault(x => x.ProjectCode == obj.ProjectCode && x.AttrCode.ToLower() == obj.AttrCode.ToLower());
                if (checkExist == null)
                {
                    obj.CreatedBy = ESEIM.AppContext.UserName;
                    obj.CreatedTime = DateTime.Now;
                    _context.ProjectAttributes.Add(obj);
                    _context.SaveChanges();
                    msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_ADD_PROPETIES"]);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_CODE_PROPETIES_EXIST"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_ERRO_ADD_ATRIBUTE"]);
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateProjectTabAttribute([FromBody]ProjectAttribute obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                obj.CreatedBy = ESEIM.AppContext.UserName;
                obj.CreatedTime = DateTime.Now;
                _context.ProjectAttributes.Update(obj);
                _context.SaveChanges();
                msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_UPPDATE_PROPETIES"]);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_ERRO_UPPDATE_PROPETIES"]);
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult DeleteProjectTabAttribute([FromBody] int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.ProjectAttributes.FirstOrDefault(x => x.Id == id);
                if (data != null)
                {
                    _context.ProjectAttributes.Remove(data);
                    _context.SaveChanges();
                    msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_DELETE_PROPETIES_SUCCESS"]);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_PROPETIES_EXIST"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_ERRO_DELETE_PROPETIES_EXIST"]);
            }
            return Json(msg);
        }
        #endregion

        #region File
        public class JTableModelFile : JTableModel
        {
            public string ProjectCode { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string CatCode { get; set; }
        }

        [HttpPost]
        public object JTableFile([FromBody]JTableModelFile jTablePara)
        {
            if (string.IsNullOrEmpty(jTablePara.ProjectCode))
            {
                return JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "Id", "FileName", "FileTypePhysic", "Desc", "Url", "CreatedTime", "UpdatedTime", "ReposName", "TypeFile", "SizeOfFile", "FileID");
            }
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var query = ((from a in _context.EDMSRepoCatFiles.Where(x => x.ObjectCode == jTablePara.ProjectCode && x.ObjectType == EnumHelper<ProjectEnum>.GetDisplayValue(ProjectEnum.Project))
                          join b in _context.EDMSFiles on a.FileCode equals b.FileCode
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
                              b.FileID,
                              SizeOfFile = b.FileSize.HasValue ? b.FileSize.Value : 0,
                          }).Union(
                  from a in _context.EDMSObjectShareFiles.Where(x => x.ObjectCode == jTablePara.ProjectCode && x.ObjectType == EnumHelper<ProjectEnum>.GetDisplayValue(ProjectEnum.Project))
                  join b in _context.EDMSFiles on a.FileCode equals b.FileCode
                  join f in _context.EDMSRepositorys on b.ReposCode equals f.ReposCode into f1
                  from f in f1.DefaultIfEmpty()
                  select new
                  {
                      Id = b.FileID,
                      b.FileCode,
                      b.FileName,
                      b.FileTypePhysic,
                      b.Desc,
                      b.CreatedTime,
                      b.CloudFileId,
                      TypeFile = "SHARE",
                      ReposName = f != null ? f.ReposName : "",
                      b.FileID,
                      SizeOfFile = b.FileSize.HasValue ? b.FileSize.Value : 0,
                  })).AsNoTracking();
            int count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "FileCode", "FileName", "FileTypePhysic", "Desc", "CreatedTime", "CloudFileId", "ReposName", "TypeFile", "FileID", "SizeOfFile");
            return jdata;
        }

        [HttpPost]
        [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
        [RequestSizeLimit(long.MaxValue)]
        public JsonResult InsertProjectFile(EDMSRepoCatFileModel obj, IFormFile fileUpload)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var mimeType = fileUpload.ContentType;
                string extension = Path.GetExtension(fileUpload.FileName);
                string urlFile = "";
                string fileId = "";
                if (Array.IndexOf(LuceneExtension.fileMimetypes, mimeType) >= 0 && (Array.IndexOf(LuceneExtension.fileExt, extension.ToUpper()) >= 0))
                {
                    string reposCode = "";
                    string catCode = "";
                    string path = "";
                    string folderId = "";
                    //Chọn file ngắn gọn
                    if (!obj.IsMore)
                    {
                        var suggesstion = GetSuggestionsProjectFile(obj.ProjectCode);
                        if (suggesstion != null)
                        {
                            reposCode = suggesstion.ReposCode;
                            path = suggesstion.Path;
                            folderId = suggesstion.FolderId;
                            catCode = suggesstion.CatCode;
                        }
                        else
                        {
                            msg.Error = true;
                            msg.Title = _stringLocalizer["PROJECT_MSG_ENTER_ATTR_EXP"];
                            return Json(msg);
                        }
                    }
                    //Hiển file mở rộng
                    else
                    {
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
                            msg.Title = _stringLocalizer["PROJECT_MSG_SELECT_FORDER"];
                            return Json(msg);
                        }
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
                        FileCode = string.Concat("PROJECT", Guid.NewGuid().ToString()),
                        ReposCode = reposCode,
                        CatCode = catCode,
                        ObjectCode = obj.ProjectCode,
                        ObjectType = EnumHelper<ProjectEnum>.GetDisplayValue(ProjectEnum.Project),
                        Path = path,
                        FolderId = folderId
                    };
                    _context.EDMSRepoCatFiles.Add(edmsReposCatFile);

                    /// created Index lucene
                    LuceneExtension.IndexFile(edmsReposCatFile.FileCode, fileUpload, string.Concat(_hostingEnvironment.WebRootPath, "\\uploads\\luceneIndex"));

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
        public JsonResult UpdateProjectFile(EDMSRepoCatFileModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                string path = "";
                string fileId = "";
                var oldSetting = _context.EDMSRepoCatFiles.FirstOrDefault(x => x.FileCode == obj.FileCode);
                if (oldSetting != null)
                {
                    var newSetting = _context.EDMSCatRepoSettings.FirstOrDefault(x => x.Id == obj.CateRepoSettingId);
                    if (newSetting != null)
                    {
                        var file = _context.EDMSFiles.FirstOrDefault(x => x.FileCode == oldSetting.FileCode);
                        //change folder
                        if ((string.IsNullOrEmpty(oldSetting.Path) && oldSetting.FolderId != newSetting.FolderId) || (string.IsNullOrEmpty(oldSetting.FolderId) && oldSetting.Path != newSetting.Path))
                        {
                            //dowload file old
                            var oldRepo = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == oldSetting.ReposCode);
                            byte[] fileData = null;
                            if (oldRepo.Type == "SERVER")
                            {
                                string ftphost = oldRepo.Server;
                                string ftpfilepath = file.Url;
                                var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + ftphost + ftpfilepath);
                                using (WebClient request = new WebClient())
                                {
                                    request.Credentials = new NetworkCredential(oldRepo.Account, oldRepo.PassWord);
                                    fileData = request.DownloadData(urlEnd);
                                }
                            }
                            else
                            {
                                fileData = FileExtensions.DowloadFileGoogle(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", file.CloudFileId);
                            }
                            //delete folder old
                            if (oldRepo.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server))
                            {
                                var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + oldRepo.Server + file.Url);
                                FileExtensions.DeleteFileFtpServer(urlEnd, oldRepo.Account, oldRepo.PassWord);
                            }
                            else if (oldRepo.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.GooglerDriver))
                            {
                                FileExtensions.DeleteFileGoogleServer(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", file.CloudFileId);
                            }

                            //insert folder new
                            var newRepo = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == newSetting.ReposCode);
                            if (newRepo.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server))
                            {
                                path = newSetting.Path + Path.Combine("/", file.FileName);
                                var pathPreventive = path + Path.Combine("/", Guid.NewGuid().ToString().Substring(0, 8) + file.FileName);
                                var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + newRepo.Server + path);
                                var urlEndPreventive = System.Web.HttpUtility.UrlPathEncode("ftp://" + newRepo.Server + pathPreventive);
                                var result = FileExtensions.UploadFileToFtpServer(urlEnd, urlEndPreventive, fileData, newRepo.Account, newRepo.PassWord);
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
                                        path = pathPreventive;
                                    }
                                }
                                else
                                {
                                    msg.Error = true;
                                    msg.Title = _sharedResources["COM_MSG_ERR"];
                                    return Json(msg);
                                }
                            }
                            else if (newRepo.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.GooglerDriver))
                            {
                                fileId = FileExtensions.UploadFileToDrive(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", file.FileName, new MemoryStream(fileData), file.MimeType, newSetting.FolderId);
                            }
                            file.CloudFileId = fileId;
                            file.Url = path;

                            //update setting new
                            oldSetting.CatCode = newSetting.CatCode;
                            oldSetting.ReposCode = newSetting.ReposCode;
                            oldSetting.Path = newSetting.Path;
                            oldSetting.FolderId = newSetting.FolderId;
                            _context.EDMSRepoCatFiles.Update(oldSetting);
                        }
                        //update header
                        file.Desc = obj.Desc;
                        file.Tags = obj.Tags;
                        file.NumberDocument = obj.NumberDocument;
                        _context.EDMSFiles.Update(file);
                        _context.SaveChanges();
                        msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["PROJECT_MSG_SELECT_FORDER"];
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["PROJECT_MSG_FILE_NOT_EXITS"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Object = ex;
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult DeleteProjectFile(int id)
        {
            var msg = new JMessage() { Error = false };
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
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_DELETE_FILE_SUCCESS"];// "Xóa thành công";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_FAIL"], _stringLocalizer[""]);//"Có lỗi xảy ra khi xóa!";
                msg.Object = ex;
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetProjectFile(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var model = new EDMSRepoCatFileModel();
            try
            {
                var data = _context.EDMSRepoCatFiles.FirstOrDefault(m => m.Id == id);
                if (data != null)
                {
                    var file = _context.EDMSFiles.FirstOrDefault(x => x.FileCode == data.FileCode);
                    //header file
                    model.FileCode = file.FileCode;
                    model.NumberDocument = file.NumberDocument;
                    model.Tags = file.Tags;
                    model.Desc = file.Desc;
                    //category file
                    model.CateRepoSettingCode = data.CatCode;
                    model.CateRepoSettingId = data.Id;
                    model.Path = data.Path;
                    model.FolderId = data.FolderId;
                    msg.Object = model;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["CONTRACT_MSG_FILE_DOES_NOT_EXIST"]);//"Tệp tin không tồn tại!";
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

        [HttpGet]
        public EDMSRepoCatFile GetSuggestionsProjectFile(string projectCode)
        {
            var query = _context.EDMSRepoCatFiles.Where(x => x.ObjectCode == projectCode && x.ObjectType == EnumHelper<ProjectEnum>.GetDisplayValue(ProjectEnum.Project)).MaxBy(x => x.Id);
            return query;
        }

        //[NonAction]
        //public JMessage InsertProjectFileRaw(EDMSRepoCatFileModel obj, IFormFile fileUpload, bool fromServer = true)
        //{
        //    var msg = new JMessage() { Error = false, Title = "" };
        //    try
        //    {
        //        var mimeType = fileUpload.ContentType;
        //        string extension = Path.GetExtension(fileUpload.FileName);
        //        string urlFile = "";
        //        string fileId = "";
        //        if (Array.IndexOf(LuceneExtension.fileMimetypes, mimeType) >= 0 && (Array.IndexOf(LuceneExtension.fileExt, extension.ToUpper()) >= 0))
        //        {
        //            string reposCode = "";
        //            string catCode = "";
        //            string path = "";
        //            string folderId = "";
        //            if (obj.IsMore)
        //            {
        //                var suggesstion = GetSuggestionsProjectFile(obj.ProjectCode);
        //                if (suggesstion != null)
        //                {
        //                    reposCode = suggesstion.ReposCode;
        //                    path = suggesstion.Path;
        //                    folderId = suggesstion.FolderId;
        //                    catCode = suggesstion.CatCode;
        //                }
        //                else
        //                {
        //                    msg.Error = true;
        //                    msg.Title = "Vui lòng nhập thuộc tính mở rộng!";
        //                    return msg;
        //                }
        //            }
        //            else
        //            {
        //                var setting = _context.EDMSCatRepoSettings.FirstOrDefault(x => x.Id == obj.CateRepoSettingId);
        //                if (setting != null)
        //                {
        //                    reposCode = setting.ReposCode;
        //                    path = setting.Path;
        //                    folderId = setting.FolderId;
        //                    catCode = setting.CatCode;
        //                }
        //                else
        //                {
        //                    msg.Error = true;
        //                    msg.Title = "Vui lòng chọn thư mục lưu trữ!";
        //                    return msg;
        //                }
        //            }
        //            var getRepository = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == reposCode);
        //            if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server))
        //            {
        //                using (var ms = new MemoryStream())
        //                {
        //                    fileUpload.CopyTo(ms);
        //                    var fileBytes = ms.ToArray();
        //                    urlFile = path + Path.Combine("/", fileUpload.FileName);
        //                    var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + getRepository.Server + urlFile);
        //                    FileExtensions.UploadFileToFtpServer(urlEnd, fileBytes, getRepository.Account, getRepository.PassWord);
        //                }
        //            }
        //            else if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.GooglerDriver))
        //            {
        //                fileId = FileExtensions.UploadFileToDrive(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", fileUpload.FileName, fileUpload.OpenReadStream(), fileUpload.ContentType, folderId);
        //            }
        //            var edmsReposCatFile = new EDMSRepoCatFile
        //            {
        //                FileCode = string.Concat("PROJECT", Guid.NewGuid().ToString()),
        //                ReposCode = reposCode,
        //                CatCode = catCode,
        //                ObjectCode = obj.ProjectCode,
        //                ObjectType = EnumHelper<ProjectEnum>.GetDisplayValue(ProjectEnum.Project),
        //                Path = path,
        //                FolderId = folderId
        //            };
        //            _context.EDMSRepoCatFiles.Add(edmsReposCatFile);

        //            //add File
        //            var file = new EDMSFile
        //            {
        //                FileCode = edmsReposCatFile.FileCode,
        //                FileName = fileUpload.FileName,
        //                Desc = obj.Desc,
        //                ReposCode = reposCode,
        //                Tags = obj.Tags,
        //                FileSize = fileUpload.Length,
        //                FileTypePhysic = Path.GetExtension(fileUpload.FileName),
        //                NumberDocument = obj.NumberDocument,
        //                CreatedBy = ESEIM.AppContext.UserName,
        //                CreatedTime = DateTime.Now,
        //                Url = urlFile,
        //                MimeType = mimeType,
        //                CloudFileId = fileId,
        //            };
        //            _context.EDMSFiles.Add(file);
        //        }
        //        else
        //        {
        //            msg.Error = true;
        //            msg.Title = String.Format("CONTRACT_MSG_FORMAT_NOT_ALLOWED");// "Định dạng tệp không cho phép!";
        //        }


        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Object = ex;
        //        msg.Title = "Có lỗi xảy ra. Xin thử lại!";
        //    }
        //    return msg;
        //}

        //[NonAction]
        //public JMessage InsertProjectFileRaw(EDMSRepoCatFileModel obj, EDMSRepoCatFile item, EDMSRepository oldRes, bool fromServer = true)
        //{
        //    var msg = new JMessage() { Error = false, Title = "" };
        //    try
        //    {
        //        var file1 = _context.EDMSFiles.FirstOrDefault(x => x.FileCode == item.FileCode);
        //        if (fromServer == true)
        //        {
        //            var mimeType = file1.MimeType;
        //            string extension = file1.FileTypePhysic;
        //            string urlFile = "";
        //            string fileId = "";
        //            if (Array.IndexOf(LuceneExtension.fileMimetypes, mimeType) >= 0 && (Array.IndexOf(LuceneExtension.fileExt, extension.ToUpper()) >= 0))
        //            {
        //                string reposCode = "";
        //                string catCode = "";
        //                string path = "";
        //                string folderId = "";

        //                var setting = _context.EDMSCatRepoSettings.FirstOrDefault(x => x.Id == obj.CateRepoSettingId);
        //                if (setting != null)
        //                {
        //                    reposCode = setting.ReposCode;
        //                    path = setting.Path;
        //                    folderId = setting.FolderId;
        //                    catCode = setting.CatCode;
        //                }
        //                else
        //                {
        //                    msg.Error = true;
        //                    msg.Title = "Vui lòng chọn thư mục lưu trữ!";
        //                    return msg;
        //                }
        //                string ftphost = oldRes.Server;
        //                string ftpfilepath = file1.Url;
        //                var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + ftphost + ftpfilepath);
        //                WebClient request = new WebClient();
        //                request.Credentials = new NetworkCredential(oldRes.Account, oldRes.PassWord);
        //                var fileBytes = request.DownloadData(urlEnd);

        //                var getRepository = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == reposCode);
        //                if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server))
        //                {
        //                    urlFile = path + Path.Combine("/", file1.FileName);
        //                    urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + getRepository.Server + urlFile);
        //                    FileExtensions.UploadFileToFtpServer(urlEnd, fileBytes, getRepository.Account, getRepository.PassWord);

        //                }
        //                else if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.GooglerDriver))
        //                {
        //                    var mStream = new MemoryStream(fileBytes);
        //                    fileId = FileExtensions.UploadFileToDrive(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", file1.FileName, mStream, file1.MimeType, folderId);
        //                }
        //                var edmsReposCatFile = new EDMSRepoCatFile
        //                {
        //                    FileCode = string.Concat("PROJECT", Guid.NewGuid().ToString()),
        //                    ReposCode = reposCode,
        //                    CatCode = catCode,
        //                    ObjectCode = obj.ProjectCode,
        //                    ObjectType = EnumHelper<ProjectEnum>.GetDisplayValue(ProjectEnum.Project),
        //                    Path = path,
        //                    FolderId = folderId
        //                };
        //                _context.EDMSRepoCatFiles.Add(edmsReposCatFile);

        //                /// created Index lucene
        //                //LuceneExtension.IndexFile(edmsReposCatFile.FileCode, mimeType, extension, _hostingEnvironment.WebRootPath + Path.Combine(getRepository.PathPhysic, upload.Object.ToString()), _hostingEnvironment.WebRootPath + "\\uploads\\luceneIndex");

        //                //add File
        //                var file = new EDMSFile
        //                {
        //                    FileCode = edmsReposCatFile.FileCode,
        //                    FileName = file1.FileName,
        //                    Desc = obj.Desc,
        //                    ReposCode = reposCode,
        //                    Tags = obj.Tags,
        //                    FileSize = file1.FileSize,
        //                    FileTypePhysic = file1.FileTypePhysic,
        //                    NumberDocument = obj.NumberDocument,
        //                    CreatedBy = ESEIM.AppContext.UserName,
        //                    CreatedTime = DateTime.Now,
        //                    Url = urlFile,
        //                    MimeType = mimeType,
        //                    CloudFileId = fileId,
        //                };
        //                _context.EDMSFiles.Add(file);
        //            }
        //            else
        //            {
        //                msg.Error = true;
        //                msg.Title = String.Format("CONTRACT_MSG_FORMAT_NOT_ALLOWED");// "Định dạng tệp không cho phép!";
        //            }
        //        }
        //        else
        //        {
        //            // move from driver
        //            byte[] arr = FileExtensions.DowloadFileGoogle(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", file1.CloudFileId);
        //            var mimeType = file1.MimeType;
        //            string extension = file1.FileTypePhysic;
        //            string urlFile = "";
        //            string fileId = "";
        //            if (Array.IndexOf(LuceneExtension.fileMimetypes, mimeType) >= 0 && (Array.IndexOf(LuceneExtension.fileExt, extension.ToUpper()) >= 0))
        //            {
        //                string reposCode = "";
        //                string catCode = "";
        //                string path = "";
        //                string folderId = "";

        //                var setting = _context.EDMSCatRepoSettings.FirstOrDefault(x => x.Id == obj.CateRepoSettingId);
        //                if (setting != null)
        //                {
        //                    reposCode = setting.ReposCode;
        //                    path = setting.Path;
        //                    folderId = setting.FolderId;
        //                    catCode = setting.CatCode;
        //                }
        //                else
        //                {
        //                    msg.Error = true;
        //                    msg.Title = "Vui lòng chọn thư mục lưu trữ!";
        //                    return msg;
        //                }
        //                var fileBytes = arr;
        //                var getRepository = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == reposCode);
        //                var urlEnd = "";
        //                if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server))
        //                {
        //                    urlFile = path + Path.Combine("/", file1.FileName);
        //                    urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + getRepository.Server + urlFile);
        //                    FileExtensions.UploadFileToFtpServer(urlEnd, fileBytes, getRepository.Account, getRepository.PassWord);

        //                }
        //                else if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.GooglerDriver))
        //                {
        //                    var mStream = new MemoryStream(fileBytes);
        //                    fileId = FileExtensions.UploadFileToDrive(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", file1.FileName, mStream, file1.MimeType, folderId);
        //                }
        //                var edmsReposCatFile = new EDMSRepoCatFile
        //                {
        //                    FileCode = string.Concat("PROJECT", Guid.NewGuid().ToString()),
        //                    ReposCode = reposCode,
        //                    CatCode = catCode,
        //                    ObjectCode = obj.ProjectCode,
        //                    ObjectType = EnumHelper<ContractEnum>.GetDisplayValue(ContractEnum.Contract),
        //                    Path = path,
        //                    FolderId = folderId
        //                };
        //                _context.EDMSRepoCatFiles.Add(edmsReposCatFile);

        //                //add File
        //                var file = new EDMSFile
        //                {
        //                    FileCode = edmsReposCatFile.FileCode,
        //                    FileName = file1.FileName,
        //                    Desc = obj.Desc,
        //                    ReposCode = reposCode,
        //                    Tags = obj.Tags,
        //                    FileSize = file1.FileSize,
        //                    FileTypePhysic = file1.FileTypePhysic,
        //                    NumberDocument = obj.NumberDocument,
        //                    CreatedBy = ESEIM.AppContext.UserName,
        //                    CreatedTime = DateTime.Now,
        //                    Url = urlFile,
        //                    MimeType = mimeType,
        //                    CloudFileId = fileId,
        //                };
        //                _context.EDMSFiles.Add(file);
        //            }
        //            else
        //            {
        //                msg.Error = true;
        //                msg.Title = String.Format("CONTRACT_MSG_FORMAT_NOT_ALLOWED");// "Định dạng tệp không cho phép!";
        //            }
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Object = ex;
        //        msg.Title = "Có lỗi xảy ra. Xin thử lại!";
        //    }
        //    return msg;
        //}

        //[NonAction]
        //private JMessage MoveFileFromServer(EDMSRepoCatFile item, IFormFile fileUpload, EDMSRepoCatFileModel newItem, EDMSCatRepoSetting newSetting, EDMSRepository oldRes, EDMSRepository newRes)
        //{
        //    JMessage msg = new JMessage() { Error = false };
        //    try
        //    {
        //        var file = _context.EDMSFiles.FirstOrDefault(x => x.FileCode == item.FileCode);
        //        DeleteProjectFileRaw(item.Id);
        //        if (fileUpload != null)
        //        {
        //            InsertProjectFileRaw(newItem, fileUpload);
        //        }
        //        else
        //        {
        //            InsertProjectFileRaw(newItem, item, oldRes);
        //        }
        //        _context.SaveChanges();
        //        msg.Title = "Cập nhật thành công";
        //        try
        //        {
        //            var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + oldRes.Server + file.Url);
        //            FileExtensions.DeleteFileFtpServer(urlEnd, oldRes.Account, oldRes.PassWord);
        //        }
        //        catch (Exception ex) { }
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Title = "Sảy ra lỗi khi cập nhật";
        //        msg.Object = ex.Message;
        //    }
        //    return msg;
        //}

        //[NonAction]
        //private JMessage MoveFileFromDriver(EDMSRepoCatFile item, IFormFile fileUpload, EDMSRepoCatFileModel newItem, EDMSCatRepoSetting newSetting, EDMSRepository oldRes, EDMSRepository newRes)
        //{
        //    JMessage msg = new JMessage() { Error = false };
        //    try
        //    {
        //        var file = _context.EDMSFiles.FirstOrDefault(x => x.FileCode == item.FileCode);
        //        DeleteProjectFileRaw(item.Id);
        //        if (fileUpload != null)
        //        {
        //            InsertProjectFileRaw(newItem, fileUpload, false);
        //        }
        //        else
        //        {
        //            InsertProjectFileRaw(newItem, item, oldRes, false);
        //        }
        //        _context.SaveChanges();
        //        msg.Title = "Cập nhật thành công";
        //        try
        //        {
        //            FileExtensions.DeleteFileGoogleServer(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", file.CloudFileId);
        //        }
        //        catch (Exception ex) { }
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Title = "Sảy ra lỗi khi cập nhật";
        //        msg.Object = ex.Message;
        //    }
        //    return msg;
        //}

        //[NonAction]
        //private void DeleteProjectFileRaw(int id)
        //{
        //    var data = _context.EDMSRepoCatFiles.FirstOrDefault(x => x.Id == id);
        //    _context.EDMSRepoCatFiles.Remove(data);

        //    var file = _context.EDMSFiles.FirstOrDefault(x => x.FileCode == data.FileCode);
        //    _context.EDMSFiles.Remove(file);

        //    LuceneExtension.DeleteIndexFile(file.FileCode, _hostingEnvironment.WebRootPath + "\\uploads\\luceneIndex");
        //}
        #endregion

        #region  Payment
        [HttpPost]
        public object GetTotalPayment([FromBody]JTableModelProject jTablePara)
        {
            if (string.IsNullOrEmpty(jTablePara.ProjectCode))
            {
                return new { totalReceipts = 0, totalExpense = 0, };
            }
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;

            var query = from a in _context.FundAccEntrys
                                            .Where(x => !x.IsDeleted
                                                        && x.IsPlan == false
                                                        && x.ObjType == "PROJECT"
                                                        && x.ObjCode == jTablePara.ProjectCode
                                                        && x.IsCompleted == true
                                                        )
                        join b in _context.FundCatReptExpss.Where(x => x.IsDeleted == false) on a.CatCode equals b.CatCode
                        orderby a.CreatedTime descending
                        where (((fromDate == null) || (fromDate != null && a.DeadLine >= fromDate))
                                && ((toDate == null) || (toDate != null && a.DeadLine <= toDate)))

                        select new
                        {
                            CatName = b.CatName,
                            Id = a.Id,
                            AetCode = a.AetCode,
                            Title = a.Title,
                            AetType = a.AetType,
                            AetRelativeType = a.AetRelativeType,
                            AetDescription = a.AetDescription,
                            Total = a.Total,
                            Payer = a.Payer,
                            Currency = a.Currency,
                            Status = a.Status,
                            Receiptter = a.Receiptter,
                            DeadLine = a.DeadLine
                        };
            var isVND = true;
            foreach(var item in query)
            {
                if(item.Currency != "VND")
                {
                    isVND = false;
                }
            }
            var totalReceipts = query.Where(x => x.AetType == "Receipt").Sum(x => x.Total * (1 / (_context.FundExchagRates.FirstOrDefault(z => z.IsDeleted == false && z.Currency.Equals(x.Currency)).Rate)) * (_context.FundExchagRates.FirstOrDefault(z => z.IsDeleted == false && z.Currency.Equals("VND")).Rate));
            var totalExpense = query.Where(x => x.AetType == "Expense").Sum(x => x.Total * (1 / (_context.FundExchagRates.FirstOrDefault(z => z.IsDeleted == false && z.Currency.Equals(x.Currency)).Rate)) * (_context.FundExchagRates.FirstOrDefault(z => z.IsDeleted == false && z.Currency.Equals("VND")).Rate));
            var rs = new { totalReceipts, totalExpense, isVND };
            return Json(rs);
        }

        [HttpPost]
        public object JTableProjectTabPayment([FromBody]JTableModelProject jTablePara)
        {
            if (string.IsNullOrEmpty(jTablePara.ProjectCode))
            {
                return JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "Id", "AetCode", "Title", "AetType", "AetDescription", "Total", "Payer", "Receiptter", "Currency", "IsPlan", "Status", "CatName", "DeadLine");
            }
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;

            var query = from a in _context.FundAccEntrys
                                            .Where(x => !x.IsDeleted
                                            //&& x.IsPlan == false
                                                        && x.ObjType == "PROJECT"
                                                        && x.ObjCode == jTablePara.ProjectCode
                                                        )
                        join b in _context.FundCatReptExpss.Where(x => x.IsDeleted == false) on a.CatCode equals b.CatCode
                        orderby a.CreatedTime descending
                        where (((fromDate == null) || (fromDate != null && a.DeadLine >= fromDate))
                        && ((toDate == null) || (toDate != null && a.DeadLine <= toDate)))
                        select new
                        {
                            CatName = b.CatName,
                            Id = a.Id,
                            AetCode = a.AetCode,
                            Title = a.Title,
                            AetType = a.AetType,
                            AetRelativeType = a.AetRelativeType,
                            AetDescription = a.AetDescription,
                            Total = a.Total,
                            Payer = a.Payer,
                            Currency = a.Currency,
                            Status = _context.FundAccEntryTrackings.Where(x => x.AetCode == a.AetCode).MaxBy(x => x.Id).Action,
                            Receiptter = a.Receiptter,
                            DeadLine = a.DeadLine
                        };
            int count = query.Count();
            var data = query.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length);
            var jdata = JTableHelper.JObjectTable(data.ToList(), jTablePara.Draw, count, "Id", "AetCode", "Title", "AetType", "AetDescription", "Total", "Payer", "Receiptter", "Currency", "IsPlan", "Status", "CatName", "DeadLine");

            return Json(jdata);

        }
        #endregion

        #region note
        public class EDMSProjectTabNote
        {
            public int? Id { get; set; }
            public string ProjectCode { get; set; }
            public string Title { get; set; }
            public string Note { get; set; }
        }
        [HttpPost]
        public object JTableProjectNote([FromBody]JTableModelProject jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            if (jTablePara.ProjectCode == null)
            {
                var list = new List<object>();
                return JTableHelper.JObjectTable(list, jTablePara.Draw, 0, "Id", "Title", "Note", "Name", "CreatedBy", "CreatedTime");
            }
            var query = from a in _context.ProjectNotes
                        join b in _context.Users on a.CreatedBy equals b.UserName into b1
                        from b in b1.DefaultIfEmpty()
                        where !a.IsDeleted
                        && (string.IsNullOrEmpty(jTablePara.Tags) || (a.Tags.ToLower().Contains(jTablePara.Tags.ToLower())))
                        && (string.IsNullOrEmpty(jTablePara.Title) || a.Title.ToLower().Contains(jTablePara.Title.ToLower()))
                        && (a.ProjectCode == jTablePara.ProjectCode)
                        select new
                        {
                            a.Id,
                            a.Title,
                            a.Note,
                            Name = b != null ? string.Join(" ", b.GivenName) : null,
                            a.CreatedBy,
                            a.CreatedTime
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "Title", "Note", "Name", "CreatedBy", "CreatedTime");
            return Json(jdata);
        }

        [HttpPost]
        public JsonResult InsertProjectTabNote([FromBody]EDMSProjectTabNote obj)
        {
            var msg = new JMessage { Error = false };
            try
            {
                var project = _context.Projects.FirstOrDefault(x => x.ProjectCode == obj.ProjectCode);
                var data = new ProjectNote()
                {
                    ProjectCode = project.ProjectCode,
                    Title = obj.Title,
                    Note = obj.Note,
                    ProjectVersion = project.Version,
                    CreatedBy = ESEIM.AppContext.UserName,
                    CreatedTime = DateTime.Now
                };
                _context.ProjectNotes.Add(data);
                _context.SaveChanges();
                msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_ADD_NOTE_PROJECT"]);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_ERRO_ADD_NOTE_PROJECT"]);
                msg.Object = ex;
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateProjectTabNote([FromBody]EDMSProjectTabNote obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.ProjectNotes.FirstOrDefault(x => x.Id == obj.Id);
                data.Title = obj.Title;
                data.Note = obj.Note;
                _context.ProjectNotes.Update(data);
                _context.SaveChanges();
                msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_UPDATE_NOTE_SUCCESS"]);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_ERRO_UPDATE_SUCCESS"]);
                msg.Object = ex;
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult DeleteprojectTabNote(int id)
        {
            var msg = new JMessage();
            try
            {
                var data = _context.ProjectNotes.FirstOrDefault(x => x.Id == id);
                data.IsDeleted = true;
                _context.ProjectNotes.Update(data);
                _context.SaveChanges();
                msg.Error = false;
                msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_DELETE_NOTE_SUCCESS"]);
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_ERRO_DELETE_NOTE_SUCCESS"]);
                msg.Object = ex;
                return Json(msg);
            }

        }

        [HttpGet]
        public JsonResult GetNote(int id)
        {
            var data = _context.ProjectNotes.FirstOrDefault(x => x.Id == id);
            return Json(data);
        }
        #endregion

        #region CardJob
        [HttpPost]
        public object JTableCardJob([FromBody]JTableModelProject jtablePara)
        {
            int intBegin = (jtablePara.CurrentPage - 1) * jtablePara.Length;
            if (jtablePara.ProjectCode == null)
            {
                var list = new List<object>();
                return JTableHelper.JObjectTable(list, jtablePara.Draw, 0, "Id", "CardCode", "Project", "CardName");
            }
            var query = from a in _context.CardMappings
                        join b in _context.WORKOSCards on a.CardCode equals b.CardCode
                        where b.IsDeleted == false && a.ProjectCode.Equals(jtablePara.ProjectCode)
                        select b;
            int count = query.Count();
            var data = query.OrderUsingSortExpression(jtablePara.QueryOrderBy).Skip(intBegin).Take(jtablePara.Length).Select(x => new
            {
                x.CardID,
                x.CardCode,
                x.CardName,
                x.BeginTime,
                x.EndTime,
                Status = _context.CommonSettings.FirstOrDefault(y => y.CodeSet == x.Status).ValueSet ?? "",
                x.Completed,
                x.Cost,
                x.LocationText,
                Quantitative = string.Concat(x.Quantitative, _context.CommonSettings.FirstOrDefault(y => y.CodeSet == x.Unit).ValueSet ?? ""),
                ListName = _context.WORKOSLists.FirstOrDefault(y => y.ListCode == x.ListCode && y.IsDeleted == false).ListName ?? "",
                BoardName = _context.WORKOSBoards.FirstOrDefault(y => y.BoardCode == (_context.WORKOSLists.FirstOrDefault(z => z.ListCode == x.ListCode && z.IsDeleted == false).BoardCode ?? "")).BoardName ?? ""
            }).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jtablePara.Draw, count, "CardID", "CardCode", "CardName", "BeginTime", "EndTime", "Status", "Completed", "Cost", "LocationText", "Quantitative", "ListName", "BoardName");
            return Json(jdata);
        }

        //[HttpPost]
        //public JsonResult AddCardRelative([FromBody] dynamic data)
        //{
        //    var msg = new JMessage() { Error = false, Title = "" };
        //    try
        //    {
        //        int projectId = data.ProjectId.Value != null ? Convert.ToInt32(data.ProjectId.Value) : 0;
        //        string cardCode = data.CardCode.Value;
        //        string projectCode = _context.Projects.FirstOrDefault(x => x.Id == projectId).ProjectCode;
        //        if (_context.CardForWObjs.Where(x => x.ObjCode.Equals(projectCode) && x.CatObjCode.Equals("PROJECT") && x.CardCode.Equals(cardCode) && x.IsDeleted == false).Count() > 0)
        //        {
        //            msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_PROJECT_EXIST_PROJECT"));
        //            msg.Error = true;
        //            return Json(msg);
        //        }
        //        var card = _context.WORKOSCards.FirstOrDefault(x => x.CardCode == cardCode);
        //        var list = _context.WORKOSLists.FirstOrDefault(x => x.ListCode == card.ListCode);
        //        var board = _context.WORKOSBoards.FirstOrDefault(x => x.BoardCode == list.BoardCode);
        //        var obj = new CardMapping
        //        {
        //            BoardCode = board.BoardCode,
        //            ListCode = card.ListCode,
        //            CardCode = cardCode,
        //            ProjectCode = projectCode,
        //            Relative = _context.CommonSettings.FirstOrDefault(x => x.Group == EnumHelper<CardEnum>.GetDisplayValue(CardEnum.ObjRelative))?.CodeSet,
        //            CreatedBy = ESEIM.AppContext.UserName,
        //            CreatedTime = DateTime.Now
        //        };
        //        _context.CardMappings.Add(obj);
        //        _context.SaveChanges();
        //        msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_PROJECT_ADD"));
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Object = ex.Message;
        //        msg.Title = String.Format(_stringLocalizer["PROJECT_MSG_PROJECT_ERRO"));
        //    }
        //    return Json(msg);
        //}

        //[HttpPost]
        //public JsonResult GetTeams()
        //{
        //    var data = _context.WORKOSTeams.Where(x => x.Flag == false).Select(x => new { Code = x.TeamCode, Name = x.TeamCode }).ToList();
        //    return Json(data);
        //}

        //[HttpPost]
        //public JsonResult GetBoards(string TeamCode)
        //{
        //    var data = _context.WORKOSBoards.Where(x => x.TeamCode.Equals(TeamCode)).Select(x => new { Code = x.BoardCode, Name = x.BoardName }).ToList();
        //    return Json(data);
        //}

        //[HttpPost]
        //public JsonResult GetLists(string BoardCode)
        //{
        //    var data = _context.WORKOSLists.Where(x => x.BoardCode.Equals(BoardCode)).Select(x => new { Code = x.ListCode, Name = x.ListName }).ToList();
        //    return Json(data);
        //}

        //[HttpPost]
        //public JsonResult GetCards(string ListCode)
        //{
        //    var data = _context.WORKOSCards.Where(x => x.ListCode.Equals(ListCode)).Select(x => new { Code = x.CardCode, Name = x.CardName }).ToList();
        //    return Json(data);
        //}



        //[HttpPost]
        //public JsonResult GetObjectRelative(string boardCode)
        //{
        //    var data = _context.ProjectBoards.Where(x => x.BoardCode.Equals(boardCode)).AsNoTracking().ToList();
        //    return Json(data);
        //}

        //[HttpPost]
        //public JsonResult SetObjectRelative([FromBody]dynamic data)
        //{
        //    var msg = new JMessage() { Error = true };
        //    try
        //    {
        //        string boardCode = data.boardCode.Value;
        //        var currentData = _context.ProjectBoards.Where(x => x.BoardCode.Equals(boardCode)).ToList();
        //        //for (int i = 0; i < currentData.Count; i++)
        //        //{
        //        //    _context.ProjectBoards.Update(currentData[i]);
        //        //}
        //        _context.ProjectBoards.RemoveRange(currentData);
        //        for (int i = 0; i < data.listDependency.Count; i++)
        //        {
        //            string ObjCode = data.listDependency[i].ObjCode.Value;
        //            //string Dependency = data.listDependency[i].Dependency.Value;
        //            //string Relative = data.listDependency[i].Relative.Value;
        //            var cardForObj = new ProjectBoard()
        //            {
        //                BoardCode = boardCode,
        //                ProjectCode = ObjCode,
        //            };
        //            _context.ProjectBoards.Add(cardForObj);
        //        }

        //        _context.SaveChanges();
        //        msg.Error = false;
        //        msg.Title = String.Format(_stringLocalizer["COM_MSG_UPDATE_SUCCESS"), _stringLocalizer[""));//"Cập nhật thành công";
        //        return Json(msg);
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Object = ex;
        //        msg.Title = String.Format(_stringLocalizer["COM_MSG_UPDATE_FAILED"), _stringLocalizer[""));//"Có lỗi xảy ra!";
        //        return Json(msg);
        //    }
        //}

        //[HttpPost]
        //public JsonResult DeleteCardDependency(int id)
        //{
        //    var msg = new JMessage() { Error = true };
        //    try
        //    {
        //        var data = _context.ProjectBoards.FirstOrDefault(x => x.Id == id);
        //        _context.ProjectBoards.Remove(data);
        //        _context.SaveChanges();

        //        msg.Title = String.Format(_stringLocalizer["COM_MSG_DELETE_SUCCESS"), _stringLocalizer["")); //"Xóa thành công";
        //        msg.Error = false;
        //        return Json(msg);
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Title = String.Format(_stringLocalizer["COM_MSG_DELETE_FAIL"), _stringLocalizer["")); //"Có lỗi xảy ra!";
        //        msg.Object = ex;
        //        return Json(msg);
        //    }

        //}
        #endregion

        #region Team
        public class InsertProjectTeam : Team
        {
            public string ProjectCode { get; set; }
        }

        [HttpPost]
        public JsonResult GetAllTeam()
        {
            var data = _context.Teams.Where(x => x.IsDeleted == false && x.Status == "TEAM_ACTIVE").ToList();
            return Json(data);
        }
        [HttpPost]
        public JsonResult AddTeam([FromBody]InsertProjectTeam obj)
        {
            JMessage msg = new JMessage() { Error = false };
            try
            {
                ProjectTeam data = new ProjectTeam()
                {
                    ProjectCode = obj.ProjectCode,
                    TeamCode = obj.TeamCode
                };
                _context.ProjectTeams.Add(data);
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
        public JsonResult DeleteTeam([FromBody] InsertProjectTeam obj)
        {
            JMessage msg = new JMessage() { Error = false };
            try
            {
                var data = _context.ProjectTeams.FirstOrDefault(x => x.TeamCode == obj.TeamCode && x.ProjectCode == obj.ProjectCode);
                _context.ProjectTeams.Remove(data);
                _context.SaveChanges();
                msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
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
        public JsonResult GetTeamInProject(int projectId)
        {
            var project = _context.Projects.FirstOrDefault(x => x.Id == projectId);
            if (project != null)
            {
                var query = from a in _context.ProjectTeams
                            join b in _context.Teams on a.TeamCode equals b.TeamCode into b1
                            from b2 in b1.DefaultIfEmpty()
                            where a.ProjectCode == project.ProjectCode
                            select new
                            {
                                a.TeamCode,
                                TeamName = (b2 != null ? b2.TeamName : "")
                            };
                var list = query.ToList();
                return Json(list);
            }
            else
            {
                return Json("");
            }
        }
        #endregion

        #region Contract
        [HttpPost]
        public object JTableContract([FromBody]JTableModelProject jTablePara)
        {
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            decimal? totalContract = 0;
            var query = from a in _context.PoSaleHeaders
                        join c in _context.Customerss.Where(x => !x.IsDeleted) on a.CusCode equals c.CusCode
                        join b in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Currency equals b.CodeSet into b1
                        from b2 in b1.DefaultIfEmpty()
                        where a.IsDeleted == false
                        && a.PrjCode.Equals(jTablePara.ProjectCode)
                        && (string.IsNullOrEmpty(jTablePara.ContractCode) || (a.ContractCode.ToLower().Contains(jTablePara.ContractCode.ToLower())))
                        && (string.IsNullOrEmpty(jTablePara.ContractNo) || (a.ContractNo.ToLower().Contains(jTablePara.ContractNo.ToLower())))
                        && (string.IsNullOrEmpty(jTablePara.Title) || (a.Title.ToLower().Contains(jTablePara.Title.ToLower())))
                        select new
                        {
                            id = a.ContractHeaderID,
                            code = a.ContractCode,
                            no = a.ContractNo,
                            cusName = c.CusName,
                            title = a.Title,
                            effectiveDate = a.EffectiveDate,
                            budgetExcludeTax = a.BudgetExcludeTax,
                            currency = b2 != null ? b2.ValueSet : "",
                            budget = a.BudgetExcludeTax * a.ExchangeRate,
                        };

            if (query.Any())
                totalContract = query.Sum(x => x.budget);

            var queryRs = from a in query
                          select new
                          {
                              a.id,
                              a.code,
                              a.no,
                              a.cusName,
                              a.title,
                              a.effectiveDate,
                              a.budgetExcludeTax,
                              a.budget,
                              a.currency,
                              totalContract
                          };

            int count = queryRs.Count();
            var data = queryRs.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "id", "code", "no", "cusName", "title", "effectiveDate", "budgetExcludeTax", "budget", "currency", "totalContract");
            return Json(jdata);
        }
        #endregion

        #region YC đặt hàng

        [HttpPost]
        public JsonResult GetContractPoBuyer()
        {
            var query = _context.PoBuyerHeaders.Where(x => !x.IsDeleted).Select(x => new { Code = x.PoSupCode, Name = x.PoTitle });
            return Json(query);
        }

        [HttpPost]
        public JsonResult GetContractSale()
        {
            var query = _context.PoSaleHeaders.Where(x => !x.IsDeleted).Select(x => new { Code = x.ContractCode, Name = x.Title });
            return Json(query);
        }

        [HttpGet]
        public object GetObjectRelative()
        {
            var data = _context.CommonSettings.Where(x => x.Group == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.Relative)).OrderBy(x => x.SettingID).Select(x => new { Code = x.CodeSet, Name = x.ValueSet, Icon = x.Logo });
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetRqImpProduct()
        {
            var query = _context.RequestImpProductHeaders.Where(x => !x.IsDeleted).Select(x => new { Code = x.ReqCode, Name = x.Title });
            return Json(query);
        }

        [HttpPost]
        public object JtableRequestImportProduct([FromBody]JTableModelProject jTablePara)
        {
            if (string.IsNullOrEmpty(jTablePara.ProjectCode))
            {
                return JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "id", "Code", "status", "icon", "duration", "Name", "budget", "currency", "signer", "cusCode", "cusName", "contractNo", "budgetExcludeTax", "contractDate", "sEndDate", "ExchangeRate");
            }
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = (from a in _context.MappingMains
                         join b in _context.RequestImpProductHeaders on a.ObjCode equals b.ReqCode
                         join c in _context.Customerss.Where(x => !x.IsDeleted) on b.CusCode equals c.CusCode
                         join d in _context.Users.Where(x => x.Active) on b.CreatedBy equals d.UserName into d1
                         from d2 in d1.DefaultIfEmpty()
                         where a.ObjRootCode == jTablePara.ProjectCode && a.ObjType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.RqPrice)
                         select new
                         {
                             a.Id,
                             a.ObjCode,
                             b.Title,
                             b.CusCode,
                             c.CusName,
                             CreatedBy = d2.GivenName,
                             b.CreatedTime,
                             a.ObjRelative,
                             a.ObjNote
                         }).Union(
                from a in _context.MappingMains.Where(x => x.ObjRootType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.RqPrice))
                join b in _context.RequestImpProductHeaders on a.ObjRootCode equals b.ReqCode
                join c in _context.Customerss.Where(x => !x.IsDeleted) on b.CusCode equals c.CusCode
                join d in _context.Users.Where(x => x.Active) on b.CreatedBy equals d.UserName into d1
                from d2 in d1.DefaultIfEmpty()
                where a.ObjCode == jTablePara.ProjectCode && a.ObjType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.Project)
                select new
                {
                    a.Id,
                    ObjCode = a.ObjRootCode,
                    b.Title,
                    b.CusCode,
                    c.CusName,
                    CreatedBy = d2.GivenName,
                    b.CreatedTime,
                    a.ObjRelative,
                    a.ObjNote
                });
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "ObjCode", "Title", "CusCode", "CusName", "CreatedBy", "CreatedTime", "ObjRelative", "ObjNote");
            return Json(jdata);
        }

        [HttpPost]
        public JsonResult InsertRequestImportProduct([FromBody]MappingMain obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var checkExist = _context.MappingMains.FirstOrDefault(x => x.ObjRootCode == obj.ObjRootCode && x.ObjType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.RqPrice) && x.ObjCode == obj.ObjCode);
                if (checkExist == null)
                {
                    obj.ObjType = EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.RqPrice);
                    obj.ObjRootType = EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.Project);
                    obj.CreatedBy = ESEIM.AppContext.UserName;
                    obj.CreatedTime = DateTime.Now;
                    _context.MappingMains.Add(obj);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["PROJECT_MSG_RQ_IMP_EXIST"];
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
        public JsonResult UpdateRequestImportProduct([FromBody]MappingMain obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var checkExist = _context.MappingMains.FirstOrDefault(x => x.Id == obj.Id);
                if (checkExist != null)
                {
                    checkExist.ObjRelative = obj.ObjRelative;
                    checkExist.ObjNote = obj.ObjNote;
                    checkExist.UpdatedBy = ESEIM.AppContext.UserName;
                    checkExist.UpdatedTime = DateTime.Now;
                    _context.MappingMains.Update(checkExist);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_MSG_ERR"];
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
        public JsonResult DeleteRequestImportProduct(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.MappingMains.FirstOrDefault(x => x.Id == id);
                if (data != null)
                {
                    _context.MappingMains.Remove(data);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_MSG_ERR"];
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
        #endregion

        #region Contract PO Buyer
        [HttpPost]
        public object JtableContractPoBuyer([FromBody]JTableModelProject jTablePara)
        {
            if (string.IsNullOrEmpty(jTablePara.ProjectCode))
            {
                return JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "id", "Code", "status", "icon", "duration", "Name", "budget", "currency", "signer", "cusCode", "cusName", "contractNo", "budgetExcludeTax", "contractDate", "sEndDate", "ExchangeRate");
            }
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = (from a in _context.MappingMains
                         join b in _context.PoBuyerHeaderPayments on a.ObjCode equals b.PoSupCode
                         join c in _context.Suppliers.Where(x => !x.IsDeleted) on b.SupCode equals c.SupCode
                         where a.ObjRootCode == jTablePara.ProjectCode && a.ObjType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.PoBuy)
                         select new
                         {
                             a.Id,
                             a.ObjCode,
                             b.Type,
                             b.OrderBy,
                             b.Consigner,
                             c.SupName,
                             b.CreatedTime,
                             a.ObjRelative,
                             a.ObjNote
                         }).Union(
                from a in _context.MappingMains.Where(x => x.ObjRootType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.PoBuy))
                join b in _context.PoBuyerHeaderPayments on a.ObjRootCode equals b.PoSupCode
                join c in _context.Suppliers.Where(x => !x.IsDeleted) on b.SupCode equals c.SupCode
                where a.ObjCode == jTablePara.ProjectCode && a.ObjType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.Project)
                select new
                {
                    a.Id,
                    ObjCode = a.ObjRootCode,
                    b.Type,
                    b.OrderBy,
                    b.Consigner,
                    c.SupName,
                    b.CreatedTime,
                    a.ObjRelative,
                    a.ObjNote
                });
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "ObjCode", "Type", "OrderBy", "Consigner", "SupName", "CreatedTime", "ObjRelative", "ObjNote");
            return Json(jdata);
        }

        [HttpPost]
        public JsonResult InsertContractPoBuyer([FromBody]MappingMain obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var checkExist = _context.MappingMains.FirstOrDefault(x => x.ObjRootCode == obj.ObjRootCode && x.ObjType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.PoBuy) && x.ObjCode == obj.ObjCode);
                if (checkExist == null)
                {
                    obj.ObjType = EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.PoBuy);
                    obj.ObjRootType = EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.Project);
                    obj.CreatedBy = ESEIM.AppContext.UserName;
                    obj.CreatedTime = DateTime.Now;
                    _context.MappingMains.Add(obj);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["PROJECT_MSG_CONTRACT_EXIST"];
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
        public JsonResult UpdateContractPoBuyer([FromBody]MappingMain obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var checkExist = _context.MappingMains.FirstOrDefault(x => x.Id == obj.Id);
                if (checkExist != null)
                {
                    checkExist.ObjRelative = obj.ObjRelative;
                    checkExist.ObjNote = obj.ObjNote;
                    checkExist.UpdatedBy = ESEIM.AppContext.UserName;
                    checkExist.UpdatedTime = DateTime.Now;
                    _context.MappingMains.Update(checkExist);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_MSG_ERR"];
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
        public JsonResult DeleteContractPoBuyer(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.MappingMains.FirstOrDefault(x => x.Id == id);
                if (data != null)
                {
                    _context.MappingMains.Remove(data);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_MSG_ERR"];
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
        #endregion

        #region Contract Sale
        [HttpPost]
        public object JtableContractSale([FromBody]JTableModelProject jTablePara)
        {
            if (string.IsNullOrEmpty(jTablePara.ProjectCode))
            {
                return JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "id", "Code", "status", "icon", "duration", "Name", "budget", "currency", "signer", "cusCode", "cusName", "contractNo", "budgetExcludeTax", "contractDate", "sEndDate", "ExchangeRate");
            }
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = (from a in _context.MappingMains
                         join b in _context.PoSaleHeaders on a.ObjCode equals b.ContractCode
                         join c in _context.Customerss.Where(x => !x.IsDeleted) on b.CusCode equals c.CusCode
                         where a.ObjRootCode == jTablePara.ProjectCode && a.ObjType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.PoSale)
                         select new
                         {
                             a.Id,
                             a.ObjCode,
                             c.CusName,
                             b.ContractNo,
                             b.EndDate,
                             b.Title,
                             b.Budget,
                             b.BudgetExcludeTax,
                             b.ExchangeRate,
                             a.ObjRelative,
                             a.ObjNote
                         }).Union(
                from a in _context.MappingMains.Where(x => x.ObjRootType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.PoSale))
                join b in _context.PoSaleHeaders on a.ObjRootCode equals b.ContractCode
                join c in _context.Customerss.Where(x => !x.IsDeleted) on b.CusCode equals c.CusCode
                where a.ObjCode == jTablePara.ProjectCode && a.ObjType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.Project)
                select new
                {
                    a.Id,
                    ObjCode = a.ObjRootCode,
                    c.CusName,
                    b.ContractNo,
                    b.EndDate,
                    b.Title,
                    b.Budget,
                    b.BudgetExcludeTax,
                    b.ExchangeRate,
                    a.ObjRelative,
                    a.ObjNote
                });
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "ObjCode", "CusName", "ContractNo", "EndDate", "Title", "Budget", "BudgetExcludeTax", "ExchangeRate", "ObjRelative", "ObjNote");
            return Json(jdata);
        }

        [HttpPost]
        public JsonResult InsertContractSale([FromBody]MappingMain obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var checkExist = _context.MappingMains.FirstOrDefault(x => x.ObjRootCode == obj.ObjRootCode && x.ObjType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.PoSale) && x.ObjCode == obj.ObjCode);
                if (checkExist == null)
                {
                    obj.ObjType = EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.PoSale);
                    obj.ObjRootType = EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.Project);
                    obj.CreatedBy = ESEIM.AppContext.UserName;
                    obj.CreatedTime = DateTime.Now;
                    _context.MappingMains.Add(obj);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["PROJECT_MSG_CONTRACT_PO_EXIST"];
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
        public JsonResult UpdateContractSale([FromBody]MappingMain obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var checkExist = _context.MappingMains.FirstOrDefault(x => x.Id == obj.Id);
                if (checkExist != null)
                {
                    checkExist.ObjRelative = obj.ObjRelative;
                    checkExist.ObjNote = obj.ObjNote;
                    checkExist.UpdatedBy = ESEIM.AppContext.UserName;
                    checkExist.UpdatedTime = DateTime.Now;
                    _context.MappingMains.Update(checkExist);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_MSG_ERR"];
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
        public JsonResult DeleteContractSale(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.MappingMains.FirstOrDefault(x => x.Id == id);
                if (data != null)
                {
                    _context.MappingMains.Remove(data);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_MSG_ERR"];
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
        #endregion

        #region Đặt hàng NCC
        [HttpPost]
        public object JTableTabContractPo([FromBody]JTableModelProject jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.PoBuyerHeaderPayments
                       .Where(x => !x.IsDeleted &&
                               x.ProjectCode.Equals(jTablePara.ProjectCode) &&
                             (string.IsNullOrEmpty(jTablePara.Title) || (x.PoSupCode.ToLower().Contains(jTablePara.Title.ToLower())))
                             )
                        join b in _context.Customerss.Where(x => !x.IsDeleted) on a.BuyerCode equals b.CusCode
                        join c in _context.Suppliers.Where(x => !x.IsDeleted) on a.SupCode equals c.SupCode
                        join d in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Status equals d.CodeSet into d1
                        from d2 in d1.DefaultIfEmpty()
                        select new
                        {
                            Id = a.Id,
                            PoSupCode = a.PoSupCode,
                            PoTitle = a.PoTitle,
                            OrderBy = a.OrderBy,
                            Consigner = a.Consigner,
                            Mobile = a.Mobile,
                            Buyer = a.Buyer,
                            BuyerCode = a.BuyerCode + " - " + b.CusName,
                            SupCode = a.SupCode,
                            SupName = c.SupName,
                            CreatedBy = a.CreatedBy,
                            CreatedTime = a.CreatedTime,
                            Status = d2.ValueSet,
                            Icon = d2.Logo,
                            Type = a.Type,
                            TotalAmount = a.TotalAmount,
                            TotalPayment = a.TotalPayment,
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "PoSupCode", "PoTitle", "OrderBy", "Consigner", "Mobile", "BuyerCode", "SupCode", "SupName", "CreatedTime", "Status", "Icon", "Type", "TotalAmount", "TotalPayment", "ContractNo", "Title");
            return Json(jdata);
        }
        #endregion

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_customerLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_supplierLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_cardJobController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_fileObjectShareController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_attributeManagerController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_materialProductController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion
    }
    public class JTableModelProject : JTableModel
    {
        public string ProjectCode { get; set; }
        public string ProjectTitle { get; set; }
        public string ProjectType { get; set; }
        public double? BudgetStart { get; set; }
        public double? BudgetEnd { get; set; }
        public string StartTime { get; set; }
        public string EndTime { get; set; }

        //member
        public string Fullname { get; set; }
        public string Position { get; set; }

        //atribute
        public string AttrCode { get; set; }
        public string AttrValue { get; set; }

        //file
        public string FromDate { get; set; }
        public string ToDate { get; set; }
        public string CatCode { get; set; }

        //tag
        public string Title { get; set; }
        public string Tags { get; set; }

        //contract
        public string ContractCode { get; set; }
        public string ContractNo { get; set; }
        public string BranchId { get; set; }
    }
}