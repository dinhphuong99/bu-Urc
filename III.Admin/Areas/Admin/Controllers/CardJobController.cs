using System;
using System.Collections.Generic;
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

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class CardJobController : Controller
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly ICardJobService _cardService;
        private readonly IFCMPushNotification _notification;
        private readonly IGoogleAPIService _googleAPI;
        private readonly IStringLocalizer<CardJobController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IStringLocalizer<ProjectController> _stringLocalizerProject;
        private readonly IStringLocalizer<CustomerController> _stringLocalizerCustomer;
        private readonly IStringLocalizer<SupplierController> _stringLocalizerSupplier;
        private readonly IStringLocalizer<ContractController> _stringLocalizerContract;
        private readonly IStringLocalizer<SendRequestWorkPriceController> _stringLocalizerRQWPrice;
        private readonly IStringLocalizer<ContractPoController> _stringLocalizerContractPO;
        private readonly IStringLocalizer<OrderRequestRawController> _stringLocalizerRQRaw;
        private readonly IStringLocalizer<ServiceCategoryController> _stringLocalizerSVC;
        private readonly IStringLocalizer<MaterialProductController> _stringLocalizerMaterialProd;
        private readonly IStringLocalizer<StaffTimeKeepingController> _staffTimeKeepingController;

        public IActionResult Index()
        {
            return View();
        }
        public CardJobController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment,
            ICardJobService cardService, IFCMPushNotification notification, IGoogleAPIService googleAPI,
            IStringLocalizer<CardJobController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources,
            IStringLocalizer<ProjectController> stringLocalizerProject, IStringLocalizer<CustomerController> stringLocalizerCustomer,
            IStringLocalizer<SupplierController> stringLocalizerSupplier, IStringLocalizer<ContractController> stringLocalizerContract,
            IStringLocalizer<SendRequestWorkPriceController> stringLocalizerRQWPrice, IStringLocalizer<ContractPoController> stringLocalizerContractPO,
            IStringLocalizer<OrderRequestRawController> stringLocalizerRQRaw, IStringLocalizer<ServiceCategoryController> stringLocalizerSVC,
            IStringLocalizer<MaterialProductController> stringLocalizerMaterialProd, IStringLocalizer<StaffTimeKeepingController> staffTimeKeepingController)
        {
            _context = context;
            _upload = upload;
            _hostingEnvironment = hostingEnvironment;
            _cardService = cardService;
            _notification = notification;
            _googleAPI = googleAPI;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
            _stringLocalizerProject = stringLocalizerProject;
            _stringLocalizerCustomer = stringLocalizerCustomer;
            _stringLocalizerSupplier = stringLocalizerSupplier;
            _stringLocalizerContract = stringLocalizerContract;
            _stringLocalizerRQWPrice = stringLocalizerRQWPrice;
            _stringLocalizerContractPO = stringLocalizerContractPO;
            _stringLocalizerRQRaw = stringLocalizerRQRaw;
            _stringLocalizerSVC = stringLocalizerSVC;
            _stringLocalizerMaterialProd = stringLocalizerMaterialProd;
            _staffTimeKeepingController = staffTimeKeepingController;
        }
        #region CardJobLink
        [HttpPost]
        public object GetAllCardJob()
        {
            //var data = _context.WORKOSCards.Where(x => !x.IsDeleted).Select(x => new { x.CardCode, x.CardName }).ToList();
            var data = from a in _context.WORKOSCards.Where(x => !x.IsDeleted && x.Status != "TRASH")
                       select new
                       {
                           Code = a.CardCode,
                           Name = a.CardName,
                           Status = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.Status).ValueSet,
                           EndDate = a.EndTime.HasValue ? a.EndTime.Value.ToString("dd/MM/yyyy") : ""
                       };
            return data;
        }
        public class LinkCardJob
        {
            public string cardCode { get; set; }
        }
        [HttpPost]
        public JsonResult GetListLinkCardJob([FromBody]LinkCardJob jtablePara)
        {
            var query = (from a in _context.JobCardLinks
                         join b in _context.WORKOSCards on a.CardLink equals b.CardCode
                         where a.IsDeleted == false && b.IsDeleted == false && a.CardCode == jtablePara.cardCode
                         select new
                         {
                             a.Id,
                             b.CardCode,
                             b.CardName
                         });

            return Json(query);
        }
        public class InsertCardJobLink
        {
            public string cardCode { get; set; }
            public string cardLink { get; set; }
        }
        [HttpPost]
        public JsonResult InsertLinkCardJob([FromBody]InsertCardJobLink obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = _context.JobCardLinks.FirstOrDefault(x => !x.IsDeleted && x.CardCode == obj.cardCode && x.CardLink == obj.cardLink);
                if (data == null)
                {
                    JobCardLink cardLinkObj = new JobCardLink()
                    {
                        CardCode = obj.cardCode,
                        CardLink = obj.cardLink,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now,
                    };
                    _context.JobCardLinks.Add(cardLinkObj);

                    var activity = new CardUserActivity
                    {
                        UserId = ESEIM.AppContext.UserId,
                        Action = "ADD",
                        IdObject = "CARDLINK",
                        IsCheck = true,
                        CardCode = obj.cardCode,
                        CreatedTime = DateTime.Now,
                        FromDevice = "Laptop/Desktop",
                        ChangeDetails = "Thẻ việc liên kết " + _context.WORKOSCards.FirstOrDefault(x => x.CardCode == obj.cardLink).CardName
                    };
                    _context.CardUserActivitys.Add(activity);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizer["CJ_MSG_ADD_LINK_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["CJ_MSG_LINK_EXIST"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                //msg.Title = String.Format(_stringLocalize["COM_MSG_ADD_FAILED"), _stringLocalize[""));//"Có lỗi xảy ra!";
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult DeleteCardLink(int Id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var userName = ESEIM.AppContext.UserName;
                //deleted card
                var data = _context.JobCardLinks.FirstOrDefault(x => x.Id == Id);
                data.IsDeleted = true;
                data.DeletedBy = ESEIM.AppContext.UserName;
                data.DeletedTime = DateTime.Now;
                _context.JobCardLinks.Update(data);

                var activity = new CardUserActivity
                {
                    UserId = ESEIM.AppContext.UserId,
                    Action = "DELETE",
                    IdObject = "CARDLINK",
                    IsCheck = true,
                    CardCode = data.CardCode,
                    CreatedTime = DateTime.Now,
                    FromDevice = "Laptop/Desktop",
                    ChangeDetails = "Thẻ việc liên kết " + _context.WORKOSCards.FirstOrDefault(x => x.CardCode == data.CardLink).CardName
                };
                _context.CardUserActivitys.Add(activity);

                _context.SaveChanges();
                msg.Title = _stringLocalizer["CJ_MSG_DELETE_LINK_SUCCESS"];

                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Title = _sharedResources["COM_MSG_ERR"];
                //msg.Title = String.Format(_stringLocalize["COM_MSG_DELETE_FAIL"), _stringLocalize["")); //"Có lỗi xảy ra!";
                msg.Object = ex;
                return Json(msg);
            }
        }
        #endregion

        #region Search
        public class AdvanceSearchObj : JTableModel
        {
            public string ListCode { get; set; }
            public string BoardCode { get; set; }
            public string CardName { get; set; }
            public string Member { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string Status { get; set; }
            public string ObjDependency { get; set; }
            public string ObjCode { get; set; }
            public List<Properties> ListObjCode { get; set; }
            public int TabBoard { get; set; }
            public int Page { get; set; }
            public string Description { get; set; }
            public string Comment { get; set; }
            public string SubItem { get; set; }
            public string Object { get; set; }
            public string BranchId { get; set; }
            public string ObjType { get; set; }
            public string Project { get; set; }
            public string Department { get; set; }
            public string Group { get; set; }
            public string UserId { get; set; }
            public string Supplier { get; set; }
            public string Customer { get; set; }
            public string Contract { get; set; }
            public string UserName { get; set; }
            public string BoardSearch { get; set; }
        }
        #endregion

        #region Department
        [HttpPost]
        public object GetDepartment()
        {
            return _context.AdDepartments.Where(x => x.IsEnabled).Select(x => new
            {
                Code = x.DepartmentCode,
                Name = x.Title,
                Type = 2,
                Group = "Phòng ban"
            });
        }

        [HttpGet]
        public object GetListUserInDepartment(string departmentCode)
        {
            var listMember = (from a in _context.AdDepartments
                              join b in _context.Users on a.DepartmentCode equals b.DepartmentId
                              where a.DepartmentCode == departmentCode
                              && b.Active == true
                              select new
                              {
                                  UserId = b.Id,
                                  b.GivenName,
                                  Type = 3,
                                  b.DepartmentId
                              });
            return listMember;
        }

        //check Trưởng Phòng
        [HttpPost]
        public object CheckLeader(string userId)
        {
            bool check = false;
            var user = _context.Users.FirstOrDefault(x => x.Active && x.Id == userId);
            var data = _context.UserRoles.FirstOrDefault(x => x.UserId == userId && x.RoleId == "49b018ad-68af-4625-91fd-2273bb5cf749");
            if (data != null)
            {
                var userAssign = new UserTempAssign
                {
                    Id = user.Id,
                    GivenName = user.GivenName,
                    Responsibility = "",
                    DepartmentId = user.DepartmentId
                };
                check = true;

                return new
                {
                    IsLeader = check,
                    User = userAssign
                };
            }
            else
            {
                var userAssign = (from a in _context.Users.Where(x => x.Active && x.DepartmentId == user.DepartmentId)
                                  join b in _context.UserRoles.Where(x => x.RoleId == "49b018ad-68af-4625-91fd-2273bb5cf749") on a.Id equals b.UserId
                                  select new UserTempAssign
                                  {
                                      Id = a.Id,
                                      GivenName = a.GivenName,
                                      Responsibility = "ROLE_LEADER_ACCEPTED",
                                      DepartmentId = a.DepartmentId
                                  }).FirstOrDefault();
                check = false;
                return new
                {
                    IsLeader = check,
                    User = userAssign
                };
            }
        }

        [HttpPost]
        public object GetLeaderInDepartment(string code)
        {
            var data = (from a in _context.Users.Where(x => x.Active && x.DepartmentId == code)
                        join b in _context.UserRoles.Where(x => x.RoleId == "49b018ad-68af-4625-91fd-2273bb5cf749") on a.Id equals b.UserId
                        select new UserTempAssign
                        {
                            Id = a.Id,
                            GivenName = a.GivenName,
                            Responsibility = "ROLE_LEADER_ACCEPTED"
                        }).FirstOrDefault();
            return data;
        }
        public class UserTempAssign
        {
            public string Id { get; set; }
            public string GivenName { get; set; }
            public string Responsibility { get; set; }
            public string DepartmentId { get; set; }
        }

        [HttpPost]
        public JsonResult GetCardWithDepartment([FromBody]AdvanceSearchObj data)
        {
            if (data.ListObjCode.Any())
            {
                return Json(GetCardDataInDepartment(data));
            }
            else
            {
                return Json(GetCardDataOutDepartment(data));
            }
        }

        [NonAction]
        public object GetCardDataInDepartment(AdvanceSearchObj data)
        {
            var session = HttpContext.GetSessionUser();
            var user = _context.Users.FirstOrDefault(x => x.Active && x.UserName == ESEIM.AppContext.UserName);
            int intBeginFor = (data.Page - 1) * data.Length;
            var fromDate = string.IsNullOrEmpty(data.FromDate) ? (DateTime?)null : DateTime.ParseExact(data.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var toDate = string.IsNullOrEmpty(data.ToDate) ? (DateTime?)null : DateTime.ParseExact(data.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var query = (from a in _context.CardMappings.Where(x => !string.IsNullOrEmpty(x.GroupUserCode))
                         join b in _context.WORKOSCards.Where(x => !x.IsDeleted) on a.CardCode equals b.CardCode
                         join c in _context.CardCommentLists on a.CardCode equals c.CardCode into c1
                         from c2 in c1.DefaultIfEmpty()
                         join d in _context.Users.Where(x => x.Active) on b.CreatedBy equals d.UserName
                         let lt = b.LstUser.Split(",", StringSplitOptions.None)
                         join g in _context.CardMappings on b.CardCode equals g.CardCode into g1
                         from g2 in g1.DefaultIfEmpty()
                         where data.ListObjCode.Any(x => x.Code == a.GroupUserCode) &&
                         (fromDate == null || b.BeginTime.Date >= fromDate) &&
                         (toDate == null || (b.EndTime.HasValue ? b.EndTime.Value.Date : DateTime.Now.Date) <= toDate) &&
                         (string.IsNullOrEmpty(data.CardName) || b.CardName.ToUpper().Contains(data.CardName.ToUpper())) &&
                         (string.IsNullOrEmpty(data.BranchId) || d.BranchId.ToUpper().Equals(data.BranchId.ToUpper())) &&
                         (string.IsNullOrEmpty(data.Status) || (!string.IsNullOrEmpty(b.Status) && b.Status.Equals(data.Status))) &&
                         (string.IsNullOrEmpty(data.CardName) || b.Description.ToUpper().Contains(data.CardName.ToUpper())) &&
                         (string.IsNullOrEmpty(data.CardName) || c2.CmtContent.ToUpper().Contains(data.CardName.ToUpper()))
                         //(session.IsAllData || g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(b.LstUser) && lt.Any(y => session.UserId == y)) || b.CreatedBy == session.UserName)
                         && (session.IsAllData
                        || (session.IsUser && (g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(b.LstUser) && lt.Any(y => session.UserId == y)) || b.CreatedBy == session.UserName))
                        || (session.IsBranch && (!string.IsNullOrEmpty(b.LstUser) && lt.Any(k => k == session.UserId) || b.CreatedBy == session.UserName || session.ListUserOfBranch.Count() > 0 && session.ListUserOfBranch.Any(k => k == b.CreatedBy))))

                         group b by b.ListCode into g
                         select new
                         {
                             ListCode = g.Key,
                             ListCard = g.Select(y => new
                             {
                                 y.CardID,
                                 y.CardCode,
                                 y.CardName,
                                 y.Deadline,
                                 y.Quantitative,
                                 y.Unit,
                                 y.Currency,
                                 y.Status,
                                 BeginTime = y.BeginTime.ToString("dd/MM/yyyy"),
                                 EndTime = y.EndTime.HasValue ? y.EndTime.Value.ToString("dd/MM/yyyy") : "",
                                 y.Cost,
                                 y.Completed,
                                 y.LocationText,
                             }).Distinct()
                         }).AsNoTracking();
            var list = (from a in query
                        join b in _context.WORKOSLists on a.ListCode equals b.ListCode
                        where b.IsDeleted == false
                        select new { a, b });
            var listPaging = list.Skip(intBeginFor).Take(data.Length).Select(x => new
            {
                x.b.ListID,
                x.b.ListCode,
                x.b.ListName,
                x.b.Completed,
                x.b.WeightNum,
                x.b.Status,
                x.b.BeginTime,
                x.b.Deadline,
                x.b.Background,
                x.b.Order,
                ListCard = x.a.ListCard.Select(y => new
                {
                    y.CardID,
                    y.CardCode,
                    y.CardName,
                    y.Deadline,
                    y.Quantitative,
                    y.Unit,
                    y.Currency,
                    CurrencyValue = _context.CommonSettings.FirstOrDefault(z => z.CodeSet == y.Currency).ValueSet ?? "",
                    y.BeginTime,
                    y.EndTime,
                    Status = _context.CommonSettings.FirstOrDefault(z => z.CodeSet == y.Status).ValueSet ?? "",
                    CountCheckListDone = _context.CardItemChecks.Where(z => z.CardCode == y.CardCode && z.Completed == 100 && z.Flag == false).Count(),
                    CountCheckList = _context.CardItemChecks.Where(z => z.CardCode == y.CardCode && z.Flag == false).Count(),
                    y.Cost,
                    y.Completed,
                    y.LocationText,
                })
            });
            return new
            {
                Data = listPaging,
                TotalPage = (list.Count() % data.Length == 0) ? (list.Count() / data.Length) : (list.Count() / data.Length + 1),
            };
        }

        [NonAction]
        public object GetCardDataOutDepartment(AdvanceSearchObj data)
        {
            var session = HttpContext.GetSessionUser();
            var user = _context.Users.FirstOrDefault(x => x.Active && x.UserName == ESEIM.AppContext.UserName);
            int intBeginFor = (data.Page - 1) * data.Length;
            var fromDate = string.IsNullOrEmpty(data.FromDate) ? (DateTime?)null : DateTime.ParseExact(data.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var toDate = string.IsNullOrEmpty(data.ToDate) ? (DateTime?)null : DateTime.ParseExact(data.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            //danh sách card mới,thẻ mới
            if (fromDate == null && toDate == null && string.IsNullOrEmpty(data.CardName) && string.IsNullOrEmpty(data.Status) && string.IsNullOrEmpty(data.BranchId))
            {
                var query = (from a in _context.WORKOSCards
                             let lt = a.LstUser.Split(",", StringSplitOptions.None)
                             join g in _context.CardMappings on a.CardCode equals g.CardCode into g1
                             from g2 in g1.DefaultIfEmpty()
                             join c in _context.CardCommentLists on a.CardCode equals c.CardCode
                             where a.IsDeleted == false
                             && (session.IsAllData
                            || (session.IsUser && (g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(a.LstUser) && lt.Any(y => session.UserId == y)) || a.CreatedBy == session.UserName))
                            || (session.IsBranch && (!string.IsNullOrEmpty(a.LstUser) && lt.Any(k => k == session.UserId) || a.CreatedBy == session.UserName || session.ListUserOfBranch.Count() > 0 && session.ListUserOfBranch.Any(k => k == a.CreatedBy))))
                             group a by a.ListCode into g
                             select new
                             {
                                 ListCode = g.Key,
                                 ListCard = g.Select(y => new
                                 {
                                     y.CardID,
                                     y.CardCode,
                                     y.CardName,
                                     y.Deadline,
                                     y.Quantitative,
                                     y.Unit,
                                     y.Currency,
                                     CurrencyValue = "",
                                     y.BeginTime,
                                     y.EndTime,
                                     Status = y.Status,
                                     CountCheckListDone = "",
                                     CountCheckList = "",
                                     y.Cost,
                                     y.Completed,
                                     y.LocationText,
                                 }).Distinct()
                             }).AsNoTracking();
                var listPaging = from a in query.Skip(intBeginFor).Take(data.Length)
                                 join b in _context.WORKOSLists on a.ListCode equals b.ListCode
                                 select new
                                 {
                                     b.ListCode,
                                     b.ListID,
                                     b.ListName,
                                     b.Completed,
                                     b.WeightNum,
                                     b.Status,
                                     b.BeginTime,
                                     b.Deadline,
                                     b.Background,
                                     b.Order,
                                     ListCard = a.ListCard.Select(y => new
                                     {
                                         y.CardID,
                                         y.CardCode,
                                         y.CardName,
                                         y.Deadline,
                                         y.Quantitative,
                                         y.Unit,
                                         y.Currency,
                                         CurrencyValue = _context.CommonSettings.FirstOrDefault(z => z.CodeSet == y.Currency).ValueSet ?? "",
                                         BeginTime = y.BeginTime.ToString("dd/MM/yyyy"),
                                         EndTime = y.EndTime.HasValue ? y.EndTime.Value.ToString("dd/MM/yyyy") : "",
                                         Status = _context.CommonSettings.FirstOrDefault(z => z.CodeSet == y.Status).ValueSet ?? "",
                                         CountCheckListDone = _context.CardItemChecks.Where(z => z.CardCode == y.CardCode && z.Completed == 100 && z.Flag == false).Count(),
                                         CountCheckList = _context.CardItemChecks.Where(z => z.CardCode == y.CardCode && z.Flag == false).Count(),
                                         y.Cost,
                                         y.Completed,
                                         y.LocationText,
                                     })
                                 };
                return new
                {
                    Data = listPaging,
                    Total = query.Count(),
                };
            }
            else
            {
                var query = (from a in _context.WORKOSCards
                             let lt = a.LstUser.Split(",", StringSplitOptions.None)
                             join g in _context.CardMappings on a.CardCode equals g.CardCode into g1
                             from g2 in g1.DefaultIfEmpty()
                             join b in _context.Users.Where(x => x.Active) on a.CreatedBy equals b.UserName
                             where (fromDate == null || a.BeginTime >= fromDate) &&
                             (toDate == null || (a.EndTime.HasValue ? a.EndTime.Value.Date : DateTime.Now.Date) <= toDate) &&
                             (string.IsNullOrEmpty(data.CardName) || a.CardName.ToUpper().Contains(data.CardName.ToUpper())) &&
                             (string.IsNullOrEmpty(data.Status) || a.Status.Equals(data.Status)) &&
                             (string.IsNullOrEmpty(data.BranchId) || b.BranchId.Equals(data.BranchId)) &&
                             a.IsDeleted == false
                             && (session.IsAllData
                            || (session.IsUser && (g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(a.LstUser) && lt.Any(y => session.UserId == y)) || a.CreatedBy == session.UserName))
                            || (session.IsBranch && (!string.IsNullOrEmpty(a.LstUser) && lt.Any(k => k == session.UserId) || a.CreatedBy == session.UserName || session.ListUserOfBranch.Count() > 0 && session.ListUserOfBranch.Any(k => k == a.CreatedBy))))
                             group a by a.ListCode into g
                             select new
                             {
                                 ListCode = g.Key,
                                 ListCard = g.Select(y => new
                                 {
                                     y.CardID,
                                     y.CardCode,
                                     y.CardName,
                                     y.Deadline,
                                     y.Quantitative,
                                     y.Unit,
                                     y.Currency,
                                     y.Status,
                                     BeginTime = y.BeginTime.ToString("dd/MM/yyyy"),
                                     EndTime = y.EndTime.HasValue ? y.EndTime.Value.ToString("dd/MM/yyyy") : "",
                                     y.Cost,
                                     y.Completed,
                                     y.LocationText,
                                 }).Distinct()
                             }).AsNoTracking();
                var list = (from a in query
                            join b in _context.WORKOSLists on a.ListCode equals b.ListCode
                            where b.IsDeleted == false
                            select new { a, b });
                var listPaging = list.Skip(intBeginFor).Take(data.Length).Select(x => new
                {
                    x.b.ListID,
                    x.b.ListCode,
                    x.b.ListName,
                    x.b.Completed,
                    x.b.WeightNum,
                    x.b.Status,
                    x.b.BeginTime,
                    x.b.Deadline,
                    x.b.Background,
                    x.b.Order,
                    ListCard = x.a.ListCard.Select(y => new
                    {
                        y.CardID,
                        y.CardCode,
                        y.CardName,
                        y.Deadline,
                        y.Quantitative,
                        y.Unit,
                        y.Currency,
                        CurrencyValue = _context.CommonSettings.FirstOrDefault(z => z.CodeSet == y.Currency).ValueSet ?? "",
                        y.BeginTime,
                        y.EndTime,
                        Status = _context.CommonSettings.FirstOrDefault(z => z.CodeSet == y.Status).ValueSet ?? "",
                        CountCheckListDone = _context.CardItemChecks.Where(z => z.CardCode == y.CardCode && z.Completed == 100 && z.Flag == false).Count(),
                        CountCheckList = _context.CardItemChecks.Where(z => z.CardCode == y.CardCode && z.Flag == false).Count(),
                        y.Cost,
                        y.Completed,
                        y.LocationText,
                    })
                });
                return new
                {
                    Data = listPaging,
                    Total = list.Count(),
                };
            }
        }

        [NonAction]
        public IQueryable<GridCardJtable> GetGirdCardDepartment(AdvanceSearchObj dataSearch)
        {
            IQueryable<GridCardJtable> query = null;
            if (dataSearch.ListObjCode.Any())
            {
                query = GetGirdCardInDepartment(dataSearch);
            }
            else
            {
                query = GetGirdCardOutDepartment(dataSearch);
            }
            return query;
        }

        [NonAction]
        public IQueryable<GridCardJtable> GetGirdCardInDepartment(AdvanceSearchObj dataSearch)
        {
            var session = HttpContext.GetSessionUser();
            var user = _context.Users.FirstOrDefault(x => x.Active && x.UserName == ESEIM.AppContext.UserName);
            var fromDate = string.IsNullOrEmpty(dataSearch.FromDate) ? (DateTime?)null : DateTime.ParseExact(dataSearch.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var toDate = string.IsNullOrEmpty(dataSearch.ToDate) ? (DateTime?)null : DateTime.ParseExact(dataSearch.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var query = (from a in _context.WORKOSCards.Where(x => !x.IsDeleted)
                         let lt = a.LstUser.Split(",", StringSplitOptions.None)
                         join b in _context.CardMappings.Where(x => dataSearch.ListObjCode.Any(y => y.Code == x.GroupUserCode)) on a.CardCode equals b.CardCode
                         join c in _context.JcObjectIdRelatives on a.CardCode equals c.CardCode into c1
                         from c2 in c1.DefaultIfEmpty()
                         join d in _context.Users on a.CreatedBy equals d.UserName into d1
                         from d2 in d1.DefaultIfEmpty()
                         join g in _context.CardMappings on a.CardCode equals g.CardCode into g1
                         from g2 in g1.DefaultIfEmpty()
                         join h in _context.Users.Where(x => x.Active) on a.CreatedBy equals h.UserName into h1
                         from h2 in h1.DefaultIfEmpty()
                         join h in _context.WORKOSLists.Where(x => !x.IsDeleted) on a.ListCode equals h.ListCode
                         join k in _context.WORKOSBoards.Where(x => !x.IsDeleted) on h.BoardCode equals k.BoardCode
                         where (fromDate == null || a.BeginTime >= fromDate) &&
                               (toDate == null || (a.EndTime.HasValue ? a.EndTime.Value.Date : DateTime.Now.Date) <= toDate) &&
                                ((string.IsNullOrEmpty(dataSearch.CardName) || a.CardCode.ToLower().Contains(dataSearch.CardName.ToLower())) ||
                               (string.IsNullOrEmpty(dataSearch.CardName) || a.CardName.ToUpper().Contains(dataSearch.CardName.ToUpper()))) &&
                               ((string.IsNullOrEmpty(dataSearch.Status) && a.Status != "TRASH") || a.Status.Equals(dataSearch.Status)) &&
                               (string.IsNullOrEmpty(dataSearch.BranchId) || d2.BranchId.Equals(dataSearch.BranchId)) &&
                               (string.IsNullOrEmpty(dataSearch.Object) || c2.ObjID.Equals(dataSearch.Object))
                                //(session.IsAllData || g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(a.LstUser) && lt.Any(y => session.UserId == y)) || a.CreatedBy == session.UserName)
                                && (session.IsAllData
                                || (session.IsUser && (g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(a.LstUser) && lt.Any(y => session.UserId == y)) || a.CreatedBy == session.UserName))
                                || (session.IsBranch && (!string.IsNullOrEmpty(a.LstUser) && lt.Any(k => k == session.UserId) || a.CreatedBy == session.UserName || session.ListUserOfBranch.Count() > 0 && session.ListUserOfBranch.Any(k => k == a.CreatedBy))))
                         select new GridCardJtable
                         {
                             CardID = a.CardID,
                             CardCode = a.CardCode,
                             CardName = a.CardName,
                             ListName = _context.WORKOSLists.FirstOrDefault(y => y.ListCode.Equals(a.ListCode)).ListName ?? "",
                             BoardName = k.BoardName,
                             Deadline = a.Deadline,
                             Currency = _context.CommonSettings.FirstOrDefault(y => y.CodeSet == a.Currency).ValueSet ?? "",
                             Cost = a.Cost,
                             Completed = a.Completed,
                             BeginTime = a.BeginTime,
                             EndTime = a.EndTime,
                             Status = _context.CommonSettings.FirstOrDefault(y => y.CodeSet.Equals(a.Status)).ValueSet,
                             UpdateTime = a.UpdatedTime,
                             CreatedBy = h2.GivenName,
                             CreatedTime = a.CreatedDate.ToString("dd/MM/yyyy"),
                             CreatedDate = a.CreatedDate,
                             UpdatedTimeTxt = a.UpdatedTime.HasValue ? a.UpdatedTime.Value.ToString("dd/MM/yyyy HH:mm:ss") : "",
                             WorkType = !string.IsNullOrEmpty(a.WorkType) ? _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.WorkType).ValueSet : "",
                             Priority = !string.IsNullOrEmpty(a.CardLevel) ? _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.CardLevel).ValueSet : "",
                         }).DistinctBy(x => x.CardCode).OrderByDescending(x => x.UpdateTime.HasValue ? x.UpdateTime.Value : x.CreatedDate).ThenByDescending(x => x.CardID);
            IQueryable<GridCardJtable> data1 = query.AsQueryable<GridCardJtable>();
            return data1;
        }

        [NonAction]
        public IQueryable<GridCardJtable> GetGirdCardOutDepartment(AdvanceSearchObj dataSearch)
        {
            return GetGirdCardOut(dataSearch);
        }

        [NonAction]
        public IQueryable<CardMemberCustom> GetMemberInDepartment(IEnumerable<string> listDepartment)
        {
            var listUserInDepartment = from a in _context.AdDepartments.Where(x => listDepartment.Any(y => x.DepartmentCode == y))
                                       join b in _context.Users on a.DepartmentCode equals b.DepartmentId
                                       select new CardMemberCustom
                                       {
                                           UserId = b.Id,
                                       };
            return listUserInDepartment;
        }
        #endregion

        #region Project 
        public class PageProjectModel
        {
            public int Id { get; set; }
            public string Code { get; set; }
            public string Name { get; set; }
            public DateTime? CreatedTime { get; set; }
            public decimal PercentObject { get; set; }
            public int CountWork { get; set; }
            public bool IsCheck { get; set; }
        };
        [HttpGet]
        public object GetListPageProject(int page, int length, string name)
        {
            var session = HttpContext.GetSessionUser();
            var user = _context.Users.FirstOrDefault(x => x.Active && x.UserName == ESEIM.AppContext.UserName);
            int intBeginFor = (page - 1) * length;
            var count = _context.Projects.Where(x => (string.IsNullOrEmpty(name) || x.ProjectTitle.ToLower().Contains(name.ToLower())) && x.FlagDeleted == false && session.IsAllData || session.ListProject.Any(p => p.Equals(x.ProjectCode))).Count();
            var data = _context.Projects.Where(x => (string.IsNullOrEmpty(name) || (x.ProjectTitle.ToLower().Contains(name.ToLower()))) &&
              (x.FlagDeleted == false) && (session.IsAllData || session.ListProject.Any(p => p.Equals(x.ProjectCode)))).OrderByDescending(x => x.Id).Skip(intBeginFor).Take(length).Select(x => new PageProjectModel
              {
                  Id = x.Id,
                  Code = x.ProjectCode,
                  Name = x.ProjectTitle,
                  CreatedTime = x.CreatedTime,
                  PercentObject = 0,
                  CountWork = (from a in _context.JcObjectIdRelatives.Where(k => !k.IsDeleted)
                               join b in _context.WORKOSCards.Where(k => k.Status != "TRASH") on a.CardCode equals b.CardCode
                               let lt = b.LstUser.Split(",", StringSplitOptions.None)
                               join g in _context.CardMappings on b.CardCode equals g.CardCode into g1
                               from g2 in g1.DefaultIfEmpty()
                                   //where a.ObjID == x.ProjectCode && b.IsDeleted == false &&
                                   //(session.IsAllData || g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(b.LstUser) && lt.Any(y => session.UserId == y)) || b.CreatedBy == session.UserName)

                               where a.ObjID == x.ProjectCode && b.IsDeleted == false && (session.IsAllData
             || (session.IsUser && (g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(b.LstUser) && lt.Any(y => session.UserId == y)) || b.CreatedBy == session.UserName))
             || (session.IsBranch && (!string.IsNullOrEmpty(b.LstUser) && lt.Any(k => k == session.UserId) || b.CreatedBy == session.UserName || session.ListUserOfBranch.Count() > 0 && session.ListUserOfBranch.Any(k => k == b.CreatedBy))))
                               select new
                               {
                                   b.CardID,
                                   b.CardCode
                               }).Distinct().Count(),
                  IsCheck = false
              }).ToList();
            for (var i = 0; i < data.Count(); i++)
            {
                data[i].PercentObject = _cardService.GetPercentJCObject("PROJECT", data[i].Code);
            }
            return (new
            {
                Tab = "Dự án",
                Icon = "fas fa-folder-open",
                Total = count,
                ListData = data,
            });
        }

        [HttpPost]
        public JsonResult GetCardWithProject([FromBody]AdvanceSearchObj data)
        {
            if (data.ListObjCode.Any())
            {
                return Json(GetCardDataInProject(data));
            }
            else
            {
                return Json(GetCardDataOutProject(data));
            }
        }

        [NonAction]
        public object GetCardDataInProject(AdvanceSearchObj data)
        {
            var session = HttpContext.GetSessionUser();
            var user = _context.Users.FirstOrDefault(x => x.Active && x.UserName == ESEIM.AppContext.UserName);
            int intBeginFor = (data.Page - 1) * data.Length;
            var fromDate = string.IsNullOrEmpty(data.FromDate) ? (DateTime?)null : DateTime.ParseExact(data.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var toDate = string.IsNullOrEmpty(data.ToDate) ? (DateTime?)null : DateTime.ParseExact(data.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var query = (from a in _context.JcObjectIdRelatives.Where(x => x.ObjTypeCode == "PROJECT" && !x.IsDeleted)
                         join b in _context.WORKOSCards on a.CardCode equals b.CardCode
                         let lt = b.LstUser.Split(",", StringSplitOptions.None)
                         join g in _context.CardMappings on b.CardCode equals g.CardCode into g1
                         from g2 in g1.DefaultIfEmpty()
                         join c in _context.Users.Where(x => x.Active) on b.CreatedBy equals c.UserName
                         where data.ListObjCode.Any(x => x.Code == a.ObjID) &&
                         (fromDate == null || b.BeginTime >= fromDate) &&
                         (toDate == null || (b.EndTime.HasValue ? b.EndTime.Value.Date : DateTime.Now.Date) <= toDate) &&
                         (string.IsNullOrEmpty(data.Status) || (!string.IsNullOrEmpty(b.Status) && b.Status.Equals(data.Status))) &&
                         (string.IsNullOrEmpty(data.CardName) || b.CardName.ToUpper().Contains(data.CardName.ToUpper())) &&
                         (string.IsNullOrEmpty(data.BranchId) || c.BranchId.ToUpper().Equals(data.BranchId.ToUpper())) &&
                         b.IsDeleted == false
                         //(session.IsAllData || g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(b.LstUser) && lt.Any(y => session.UserId == y)) || b.CreatedBy == session.UserName)
                         && (session.IsAllData
                        || (session.IsUser && (g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(b.LstUser) && lt.Any(y => session.UserId == y)) || b.CreatedBy == session.UserName))
                        || (session.IsBranch && (!string.IsNullOrEmpty(b.LstUser) && lt.Any(k => k == session.UserId) || b.CreatedBy == session.UserName || session.ListUserOfBranch.Count() > 0 && session.ListUserOfBranch.Any(k => k == b.CreatedBy))))

                         group b by b.ListCode into g
                         select new
                         {
                             ListCode = g.Key,
                             ListCard = g.Select(y => new
                             {
                                 y.CardID,
                                 y.CardCode,
                                 y.CardName,
                                 y.Deadline,
                                 y.Quantitative,
                                 y.Unit,
                                 y.Currency,
                                 y.Status,
                                 BeginTime = y.BeginTime.ToString("dd/MM/yyyy"),
                                 EndTime = y.EndTime.HasValue ? y.EndTime.Value.ToString("dd/MM/yyyy") : "",
                                 y.Cost,
                                 y.Completed,
                                 y.LocationText,
                             }).Distinct()
                         }).AsNoTracking();
            var list = (from a in query
                        join b in _context.WORKOSLists on a.ListCode equals b.ListCode
                        where b.IsDeleted == false
                        select new { a, b });
            var listPaging = list.Skip(intBeginFor).Take(data.Length).Select(x => new
            {
                x.b.ListID,
                x.b.ListCode,
                x.b.ListName,
                x.b.Completed,
                x.b.WeightNum,
                x.b.Status,
                x.b.BeginTime,
                x.b.Deadline,
                x.b.Background,
                x.b.Order,
                ListCard = x.a.ListCard.Select(y => new
                {
                    y.CardID,
                    y.CardCode,
                    y.CardName,
                    y.Deadline,
                    y.Quantitative,
                    y.Unit,
                    y.Currency,
                    CurrencyValue = _context.CommonSettings.FirstOrDefault(z => z.CodeSet == y.Currency).ValueSet ?? "",
                    y.BeginTime,
                    y.EndTime,
                    Status = _context.CommonSettings.FirstOrDefault(z => z.CodeSet == y.Status).ValueSet ?? "",
                    CountCheckListDone = _context.CardItemChecks.Where(z => z.CardCode == y.CardCode && z.Completed == 100 && z.Flag == false).Count(),
                    CountCheckList = _context.CardItemChecks.Where(z => z.CardCode == y.CardCode && z.Flag == false).Count(),
                    y.Cost,
                    y.Completed,
                    y.LocationText,
                })
            });
            return new
            {
                Data = listPaging,
                Total = list.Count(),
            };
        }

        [NonAction]
        public object GetCardDataOutProject(AdvanceSearchObj data)
        {
            var session = HttpContext.GetSessionUser();
            var user = _context.Users.FirstOrDefault(x => x.Active && x.UserName == ESEIM.AppContext.UserName);
            int intBeginFor = (data.Page - 1) * data.Length;
            var fromDate = string.IsNullOrEmpty(data.FromDate) ? (DateTime?)null : DateTime.ParseExact(data.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var toDate = string.IsNullOrEmpty(data.ToDate) ? (DateTime?)null : DateTime.ParseExact(data.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            //danh sách card mới,thẻ mới
            if (fromDate == null && toDate == null && string.IsNullOrEmpty(data.CardName) && string.IsNullOrEmpty(data.Status) && string.IsNullOrEmpty(data.BranchId))
            {
                var query = (from a in _context.WORKOSCards
                             let lt = a.LstUser.Split(",", StringSplitOptions.None)
                             join g in _context.CardMappings on a.CardCode equals g.CardCode into g1
                             from g2 in g1.DefaultIfEmpty()
                             where a.CreatedDate.Date == DateTime.Today && a.IsDeleted == false
                             //(session.IsAllData || g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(a.LstUser) && lt.Any(y => session.UserId == y)) || a.CreatedBy == session.UserName)
                             && (session.IsAllData
                            || (session.IsUser && (g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(a.LstUser) && lt.Any(y => session.UserId == y)) || a.CreatedBy == session.UserName))
                            || (session.IsBranch && (!string.IsNullOrEmpty(a.LstUser) && lt.Any(k => k == session.UserId) || a.CreatedBy == session.UserName || session.ListUserOfBranch.Count() > 0 && session.ListUserOfBranch.Any(k => k == a.CreatedBy))))

                             group a by a.ListCode into g
                             select new
                             {
                                 ListCode = g.Key,
                             }).AsNoTracking();
                var list = (from a in _context.WORKOSLists
                            from b in query
                            where ((a.ListCode == b.ListCode) || (a.CreatedDate.Date == DateTime.Today) && a.IsDeleted == false)
                            select a).Distinct().AsNoTracking();
                var listPaging = list.Skip(intBeginFor).Take(data.Length).Select(x => new
                {
                    x.ListID,
                    x.ListCode,
                    x.ListName,
                    x.Completed,
                    x.WeightNum,
                    x.Status,
                    x.BeginTime,
                    x.Deadline,
                    x.Background,
                    x.Order,
                    ListCard = _context.WORKOSCards.Where(y => y.ListCode == x.ListCode && y.CreatedDate.Date == DateTime.Today && y.IsDeleted == false).Select(y => new
                    {
                        y.CardID,
                        y.CardCode,
                        y.CardName,
                        y.Deadline,
                        y.Quantitative,
                        y.Unit,
                        y.Currency,
                        CurrencyValue = _context.CommonSettings.FirstOrDefault(z => z.CodeSet == y.Currency).ValueSet ?? "",
                        BeginTime = y.BeginTime.ToString("dd/MM/yyyy"),
                        EndTime = y.EndTime.HasValue ? y.EndTime.Value.ToString("dd/MM/yyyy") : "",
                        Status = _context.CommonSettings.FirstOrDefault(z => z.CodeSet == y.Status).ValueSet ?? "",
                        CountCheckListDone = _context.CardItemChecks.Where(z => z.CardCode == y.CardCode && z.Completed == 100 && z.Flag == false).Count(),
                        CountCheckList = _context.CardItemChecks.Where(z => z.CardCode == y.CardCode && z.Flag == false).Count(),
                        y.Cost,
                        y.Completed,
                        y.LocationText,
                    })
                });
                return new
                {
                    Data = listPaging,
                    Total = list.Count(),
                };
            }
            else
            {
                var query = (from a in _context.WORKOSCards
                             let lt = a.LstUser.Split(",", StringSplitOptions.None)
                             join g in _context.CardMappings on a.CardCode equals g.CardCode into g1
                             from g2 in g1.DefaultIfEmpty()
                             join b in _context.Users.Where(x => x.Active) on a.CreatedBy equals b.UserName
                             where (fromDate == null || a.BeginTime >= fromDate) &&
                             (toDate == null || (a.EndTime.HasValue ? a.EndTime.Value.Date : DateTime.Now.Date) <= toDate) &&
                             (string.IsNullOrEmpty(data.Status) || a.Status.Equals(data.Status)) &&
                             (string.IsNullOrEmpty(data.BranchId) || b.BranchId.Equals(data.BranchId)) &&
                             (string.IsNullOrEmpty(data.CardName) || a.CardName.ToUpper().Contains(data.CardName.ToUpper())) &&
                             a.IsDeleted == false
                             //(session.IsAllData || g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(a.LstUser) && lt.Any(y => session.UserId == y)) || a.CreatedBy == session.UserName)
                             && (session.IsAllData
                            || (session.IsUser && (g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(a.LstUser) && lt.Any(y => session.UserId == y)) || a.CreatedBy == session.UserName))
                            || (session.IsBranch && (!string.IsNullOrEmpty(a.LstUser) && lt.Any(k => k == session.UserId) || a.CreatedBy == session.UserName || session.ListUserOfBranch.Count() > 0 && session.ListUserOfBranch.Any(k => k == a.CreatedBy))))

                             group a by a.ListCode into g
                             select new
                             {
                                 ListCode = g.Key,
                                 ListCard = g.Select(y => new
                                 {
                                     y.CardID,
                                     y.CardCode,
                                     y.CardName,
                                     y.Deadline,
                                     y.Quantitative,
                                     y.Unit,
                                     y.Currency,
                                     y.Status,
                                     BeginTime = y.BeginTime.ToString("dd/MM/yyyy"),
                                     EndTime = y.EndTime.HasValue ? y.EndTime.Value.ToString("dd/MM/yyyy") : "",
                                     y.Cost,
                                     y.Completed,
                                     y.LocationText,
                                 }).Distinct()
                             }).AsNoTracking();
                var list = (from a in query
                            join b in _context.WORKOSLists on a.ListCode equals b.ListCode
                            where b.IsDeleted == false
                            select new { a, b });
                var listPaging = list.Skip(intBeginFor).Take(data.Length).Select(x => new
                {
                    x.b.ListID,
                    x.b.ListCode,
                    x.b.ListName,
                    x.b.Completed,
                    x.b.WeightNum,
                    x.b.Status,
                    x.b.BeginTime,
                    x.b.Deadline,
                    x.b.Background,
                    x.b.Order,
                    ListCard = x.a.ListCard.Select(y => new
                    {
                        y.CardID,
                        y.CardCode,
                        y.CardName,
                        y.Deadline,
                        y.Quantitative,
                        y.Unit,
                        y.Currency,
                        CurrencyValue = _context.CommonSettings.FirstOrDefault(z => z.CodeSet == y.Currency).ValueSet ?? "",
                        y.BeginTime,
                        y.EndTime,
                        Status = _context.CommonSettings.FirstOrDefault(z => z.CodeSet == y.Status).ValueSet ?? "",
                        CountCheckListDone = _context.CardItemChecks.Where(z => z.CardCode == y.CardCode && z.Completed == 100 && z.Flag == false).Count(),
                        CountCheckList = _context.CardItemChecks.Where(z => z.CardCode == y.CardCode && z.Flag == false).Count(),
                        y.Cost,
                        y.Completed,
                        y.LocationText,
                    })
                });
                return new
                {
                    Data = listPaging,
                    Total = list.Count(),
                };
            }
        }

        [NonAction]
        public IQueryable<GridCardJtable> GetGirdCardProject(AdvanceSearchObj dataSearch)
        {
            IQueryable<GridCardJtable> query = null;
            if (dataSearch.ListObjCode.Any())
            {
                query = GetGirdCardInProject(dataSearch);
            }
            else
            {
                query = GetGirdCardOutProject(dataSearch);
            }
            return query;
        }

        [NonAction]
        public IQueryable<GridCardJtable> GetGirdCardInProject(AdvanceSearchObj dataSearch)
        {
            var session = HttpContext.GetSessionUser();
            var user = _context.Users.FirstOrDefault(x => x.Active && x.UserName == ESEIM.AppContext.UserName);
            var fromDate = string.IsNullOrEmpty(dataSearch.FromDate) ? (DateTime?)null : DateTime.ParseExact(dataSearch.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var toDate = string.IsNullOrEmpty(dataSearch.ToDate) ? (DateTime?)null : DateTime.ParseExact(dataSearch.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var query = (from a in _context.WORKOSCards.Where(x => !x.IsDeleted)
                         let lt = a.LstUser.Split(",", StringSplitOptions.None)
                         join c in _context.Users on a.CreatedBy equals c.UserName into c1
                         from c2 in c1.DefaultIfEmpty()
                         join g in _context.CardMappings on a.CardCode equals g.CardCode into g1
                         from g2 in g1.DefaultIfEmpty()
                         join h in _context.Users.Where(x => x.Active) on a.CreatedBy equals h.UserName into h1
                         from h2 in h1.DefaultIfEmpty()
                         join i in _context.WORKOSLists.Where(x => !x.IsDeleted) on a.ListCode equals i.ListCode
                         join k in _context.WORKOSBoards.Where(x => !x.IsDeleted) on i.BoardCode equals k.BoardCode
                         join b in _context.JcObjectIdRelatives.Where(x => dataSearch.ListObjCode.Any(y => y.Code == x.ObjID) && !x.IsDeleted) on a.CardCode equals b.CardCode
                         where (fromDate == null || a.BeginTime.Date >= fromDate) &&
                               (toDate == null || (a.EndTime.HasValue ? a.EndTime.Value.Date : DateTime.Now.Date) <= toDate) &&
                               ((string.IsNullOrEmpty(dataSearch.Status) && a.Status != "TRASH") || a.Status.Equals(dataSearch.Status)) &&
                               (string.IsNullOrEmpty(dataSearch.BranchId) || c2.BranchId.Equals(dataSearch.BranchId)) &&
                               ((string.IsNullOrEmpty(dataSearch.CardName) || a.CardCode.ToLower().Contains(dataSearch.CardName.ToLower())) || (string.IsNullOrEmpty(dataSearch.CardName) || a.CardName.ToUpper().Contains(dataSearch.CardName.ToUpper())))
                               //&& (session.IsAllData || g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(a.LstUser) && lt.Any(y => session.UserId == y)) || a.CreatedBy == session.UserName)
                               && (session.IsAllData
                                || (session.IsUser && (g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(a.LstUser) && lt.Any(y => session.UserId == y)) || a.CreatedBy == session.UserName))
                                || (session.IsBranch && (!string.IsNullOrEmpty(a.LstUser) && lt.Any(k => k == session.UserId) || a.CreatedBy == session.UserName || session.ListUserOfBranch.Count() > 0 && session.ListUserOfBranch.Any(k => k == a.CreatedBy))))
                         select new GridCardJtable
                         {
                             CardID = a.CardID,
                             CardCode = a.CardCode,
                             CardName = a.CardName,
                             ListName = _context.WORKOSLists.FirstOrDefault(y => y.ListCode.Equals(a.ListCode)).ListName ?? "",
                             BoardName = k.BoardName,
                             Deadline = a.Deadline,
                             Currency = _context.CommonSettings.FirstOrDefault(y => y.CodeSet == a.Currency).ValueSet ?? "",
                             Cost = a.Cost,
                             Completed = a.Completed,
                             BeginTime = a.BeginTime,
                             EndTime = a.EndTime,
                             Status = _context.CommonSettings.FirstOrDefault(y => y.CodeSet.Equals(a.Status)).ValueSet,
                             UpdateTime = a.UpdatedTime,
                             CreatedBy = h2.GivenName,
                             CreatedTime = a.CreatedDate.ToString("dd/MM/yyyy"),
                             CreatedDate = a.CreatedDate,
                             UpdatedTimeTxt = a.UpdatedTime.HasValue ? a.UpdatedTime.Value.ToString("dd/MM/yyyy HH:mm:ss") : "",
                             WorkType = !string.IsNullOrEmpty(a.WorkType) ? _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.WorkType).ValueSet : "",
                             Priority = !string.IsNullOrEmpty(a.CardLevel) ? _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.CardLevel).ValueSet : "",
                         }).DistinctBy(x => x.CardCode).OrderByDescending(x => x.UpdateTime.HasValue ? x.UpdateTime.Value : x.CreatedDate).ThenByDescending(x => x.CardID);
            IQueryable<GridCardJtable> data1 = query.AsQueryable<GridCardJtable>();
            return data1;
        }

        [NonAction]
        public IQueryable<GridCardJtable> GetGirdCardOutProject(AdvanceSearchObj dataSearch)
        {
            return GetGirdCardOut(dataSearch);
        }

        [HttpGet]
        public JsonResult GetLastestProject()
        {
            var data = from a in _context.WORKOSCards
                       join b in _context.JcObjectIdRelatives on a.CardCode equals b.CardCode
                       where !a.IsDeleted && !b.IsDeleted && b.ObjTypeCode == "PROJECT"
                       select b;
            var lastestId = data.Max(x => x.ID);
            //var lastestPro = _context.JcObjectIdRelatives.FirstOrDefault(x => x.ID == lastestId).ObjID;
            var lastestPro = _context.JcObjectIdRelatives.FirstOrDefault(x => x.ID == lastestId);
            if (lastestPro != null)
            {
                return Json(lastestPro.ObjID);
            }
            else
            {
                return Json("");
            }

        }
        #endregion

        #region Customer
        [HttpGet]
        public object GetListPageCustomer(int page, int length, string name)
        {
            int intBeginFor = (page - 1) * length;
            var session = HttpContext.GetSessionUser();
            var user = _context.Users.FirstOrDefault(x => x.Active && x.UserName == ESEIM.AppContext.UserName);
            var count = _context.Customerss.Where(x => (string.IsNullOrEmpty(name) || x.CusName.ToLower().Contains(name.ToLower())) && x.IsDeleted == false).Count();
            var data = _context.Customerss.Where(x => (string.IsNullOrEmpty(name) || (x.CusName.ToLower().Contains(name.ToLower()))) &&
              (x.IsDeleted == false)).OrderByDescending(x => x.CusID).Skip(intBeginFor).Take(length).Select(x => new
              {
                  Id = x.CusID,
                  Code = x.CusCode,
                  Name = x.CusName,
                  x.CreatedTime,
                  CountWork = (from a in _context.JcObjectIdRelatives.Where(k => !k.IsDeleted && k.ObjTypeCode == "CUSTOMER")
                               join b in _context.WORKOSCards.Where(k => k.Status != "TRASH") on a.CardCode equals b.CardCode
                               let lt = b.LstUser.Split(",", StringSplitOptions.None)
                               join g in _context.CardMappings on b.CardCode equals g.CardCode into g1
                               from g2 in g1.DefaultIfEmpty()
                               where a.ObjID == x.CusCode && b.IsDeleted == false
                               //(session.IsAllData || g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(b.LstUser) && lt.Any(y => session.UserId == y)) || b.CreatedBy == session.UserName)
                               && (session.IsAllData
                                || (session.IsUser && (g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(b.LstUser) && lt.Any(y => session.UserId == y)) || b.CreatedBy == session.UserName))
                                || (session.IsBranch && (!string.IsNullOrEmpty(b.LstUser) && lt.Any(k => k == session.UserId) || b.CreatedBy == session.UserName || session.ListUserOfBranch.Count() > 0 && session.ListUserOfBranch.Any(k => k == b.CreatedBy))))
                               select new
                               {
                                   b.CardID,
                                   b.CardCode
                               }).Distinct().Count(),
                  IsCheck = false
              });
            return (new
            {
                Tab = "Khách hàng",
                Icon = "fas fa-user",
                Total = count,
                ListData = data,
            });
        }

        [HttpPost]
        public JsonResult GetCardWithCustomer([FromBody]AdvanceSearchObj data)
        {
            if (data.ListObjCode.Any())
            {
                return Json(GetCardDataInCustomer(data));
            }
            else
            {
                return Json(GetCardDataOutCustomer(data));
            }
        }
        [NonAction]
        public object GetCardDataInCustomer(AdvanceSearchObj data)
        {
            var session = HttpContext.GetSessionUser();
            var user = _context.Users.FirstOrDefault(x => x.Active && x.UserName == ESEIM.AppContext.UserName);
            int intBeginFor = (data.Page - 1) * data.Length;
            var fromDate = string.IsNullOrEmpty(data.FromDate) ? (DateTime?)null : DateTime.ParseExact(data.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var toDate = string.IsNullOrEmpty(data.ToDate) ? (DateTime?)null : DateTime.ParseExact(data.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var query = (from a in _context.JcObjectIdRelatives.Where(x => x.ObjTypeCode == "CUSTOMER" && !x.IsDeleted)
                         join b in _context.WORKOSCards.Where(x => !x.IsDeleted) on a.CardCode equals b.CardCode
                         let lt = b.LstUser.Split(",", StringSplitOptions.None)
                         join g in _context.CardMappings on b.CardCode equals g.CardCode into g1
                         from g2 in g1.DefaultIfEmpty()
                         join c in _context.Users.Where(x => x.Active) on b.CreatedBy equals c.UserName
                         where data.ListObjCode.Any(x => x.Code == a.ObjID) &&
                         (fromDate == null || b.BeginTime >= fromDate) &&
                         (toDate == null || (b.EndTime.HasValue ? b.EndTime.Value.Date : DateTime.Now.Date) <= toDate) &&
                         (string.IsNullOrEmpty(data.Status) || (!string.IsNullOrEmpty(b.Status) && b.Status.Equals(data.Status))) &&
                         (string.IsNullOrEmpty(data.CardName) || b.CardName.ToUpper().Contains(data.CardName.ToUpper())) &&
                         (session.IsAllData || g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(b.LstUser) && lt.Any(y => session.UserId == y)) || b.CreatedBy == session.UserName)
                         && (session.IsAllData
                        || (session.IsUser && (g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(b.LstUser) && lt.Any(y => session.UserId == y)) || b.CreatedBy == session.UserName))
                        || (session.IsBranch && (!string.IsNullOrEmpty(b.LstUser) && lt.Any(k => k == session.UserId) || b.CreatedBy == session.UserName || session.ListUserOfBranch.Count() > 0 && session.ListUserOfBranch.Any(k => k == b.CreatedBy))))

                         group b by b.ListCode into g
                         select new
                         {
                             ListCode = g.Key,
                             ListCard = g.Select(y => new
                             {
                                 y.CardID,
                                 y.CardCode,
                                 y.CardName,
                                 y.Deadline,
                                 y.Quantitative,
                                 y.Unit,
                                 y.Currency,
                                 y.Status,
                                 BeginTime = y.BeginTime.ToString("dd/MM/yyyy"),
                                 EndTime = y.EndTime.HasValue ? y.EndTime.Value.ToString("dd/MM/yyyy") : "",
                                 y.Cost,
                                 y.Completed,
                                 y.LocationText,
                             }).Distinct()
                         }).AsNoTracking();
            var list = (from a in query
                        join b in _context.WORKOSLists on a.ListCode equals b.ListCode
                        where b.IsDeleted == false
                        select new { a, b });
            var listPaging = list.Skip(intBeginFor).Take(data.Length).Select(x => new
            {
                x.b.ListID,
                x.b.ListCode,
                x.b.ListName,
                x.b.Completed,
                x.b.WeightNum,
                x.b.Status,
                x.b.BeginTime,
                x.b.Deadline,
                x.b.Background,
                x.b.Order,
                ListCard = x.a.ListCard.Select(y => new
                {
                    y.CardID,
                    y.CardCode,
                    y.CardName,
                    y.Deadline,
                    y.Quantitative,
                    y.Unit,
                    y.Currency,
                    CurrencyValue = _context.CommonSettings.FirstOrDefault(z => z.CodeSet == y.Currency).ValueSet ?? "",
                    y.BeginTime,
                    y.EndTime,
                    Status = _context.CommonSettings.FirstOrDefault(z => z.CodeSet == y.Status).ValueSet ?? "",
                    CountCheckListDone = _context.CardItemChecks.Where(z => z.CardCode == y.CardCode && z.Completed == 100 && z.Flag == false).Count(),
                    CountCheckList = _context.CardItemChecks.Where(z => z.CardCode == y.CardCode && z.Flag == false).Count(),
                    y.Cost,
                    y.Completed,
                    y.LocationText,
                })
            });
            return new
            {
                Data = listPaging,
                Total = list.Count(),
            };
        }

        [NonAction]
        public object GetCardDataOutCustomer(AdvanceSearchObj data)
        {
            var session = HttpContext.GetSessionUser();
            var user = _context.Users.FirstOrDefault(x => x.Active && x.UserName == ESEIM.AppContext.UserName);
            int intBeginFor = (data.Page - 1) * data.Length;
            var fromDate = string.IsNullOrEmpty(data.FromDate) ? (DateTime?)null : DateTime.ParseExact(data.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var toDate = string.IsNullOrEmpty(data.ToDate) ? (DateTime?)null : DateTime.ParseExact(data.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            //danh sách card mới,thẻ mới
            if (fromDate == null && toDate == null && string.IsNullOrEmpty(data.CardName) && string.IsNullOrEmpty(data.Status) && string.IsNullOrEmpty(data.BranchId))
            {
                var query = (from a in _context.WORKOSCards
                             let lt = a.LstUser.Split(",", StringSplitOptions.None)
                             join g in _context.CardMappings on a.CardCode equals g.CardCode into g1
                             from g2 in g1.DefaultIfEmpty()
                             where a.CreatedDate.Date == DateTime.Today && a.IsDeleted == false
                             //(session.IsAllData || g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(a.LstUser) && lt.Any(y => session.UserId == y)) || a.CreatedBy == session.UserName)
                             && (session.IsAllData
                            || (session.IsUser && (g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(a.LstUser) && lt.Any(y => session.UserId == y)) || a.CreatedBy == session.UserName))
                            || (session.IsBranch && (!string.IsNullOrEmpty(a.LstUser) && lt.Any(k => k == session.UserId) || a.CreatedBy == session.UserName || session.ListUserOfBranch.Count() > 0 && session.ListUserOfBranch.Any(k => k == a.CreatedBy))))

                             group a by a.ListCode into g
                             select new
                             {
                                 ListCode = g.Key,
                             }).AsNoTracking();
                var list = (from a in _context.WORKOSLists
                            from b in query
                            where ((a.ListCode == b.ListCode) || (a.CreatedDate.Date == DateTime.Today) && a.IsDeleted == false)
                            select a).Distinct().AsNoTracking();
                var listPaging = list.Skip(intBeginFor).Take(data.Length).Select(x => new
                {
                    x.ListID,
                    x.ListCode,
                    x.ListName,
                    x.Completed,
                    x.WeightNum,
                    x.Status,
                    x.BeginTime,
                    x.Deadline,
                    x.Background,
                    x.Order,
                    ListCard = _context.WORKOSCards.Where(y => y.ListCode == x.ListCode && y.CreatedDate.Date == DateTime.Today && y.IsDeleted == false).Select(y => new
                    {
                        y.CardID,
                        y.CardCode,
                        y.CardName,
                        y.Deadline,
                        y.Quantitative,
                        y.Unit,
                        y.Currency,
                        CurrencyValue = _context.CommonSettings.FirstOrDefault(z => z.CodeSet == y.Currency).ValueSet ?? "",
                        BeginTime = y.BeginTime.ToString("dd/MM/yyyy"),
                        EndTime = y.EndTime.HasValue ? y.EndTime.Value.ToString("dd/MM/yyyy") : "",
                        Status = _context.CommonSettings.FirstOrDefault(z => z.CodeSet == y.Status).ValueSet ?? "",
                        CountCheckListDone = _context.CardItemChecks.Where(z => z.CardCode == y.CardCode && z.Completed == 100 && z.Flag == false).Count(),
                        CountCheckList = _context.CardItemChecks.Where(z => z.CardCode == y.CardCode && z.Flag == false).Count(),
                        y.Cost,
                        y.Completed,
                        y.LocationText,
                    }).Distinct()
                });
                return new
                {
                    Data = listPaging,
                    Total = list.Count(),
                };
            }
            else
            {
                var query = (from a in _context.WORKOSCards
                             let lt = a.LstUser.Split(",", StringSplitOptions.None)
                             join g in _context.CardMappings on a.CardCode equals g.CardCode into g1
                             from g2 in g1.DefaultIfEmpty()
                             join b in _context.Users.Where(x => x.Active) on a.CreatedBy equals b.UserName
                             where (fromDate == null || a.BeginTime >= fromDate) &&
                             (toDate == null || (a.EndTime.HasValue ? a.EndTime.Value.Date : DateTime.Now.Date) <= toDate) &&
                             (string.IsNullOrEmpty(data.Status) || a.Status.Equals(data.Status)) &&
                             (string.IsNullOrEmpty(data.BranchId) || b.BranchId.Equals(data.BranchId)) &&
                             (string.IsNullOrEmpty(data.CardName) || a.CardName.ToUpper().Contains(data.CardName.ToUpper())) &&
                             a.IsDeleted == false
                             //(session.IsAllData || g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(a.LstUser) && lt.Any(y => session.UserId == y)) || a.CreatedBy == session.UserName)
                             && (session.IsAllData
                            || (session.IsUser && (g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(a.LstUser) && lt.Any(y => session.UserId == y)) || a.CreatedBy == session.UserName))
                            || (session.IsBranch && (!string.IsNullOrEmpty(a.LstUser) && lt.Any(k => k == session.UserId) || a.CreatedBy == session.UserName || session.ListUserOfBranch.Count() > 0 && session.ListUserOfBranch.Any(k => k == a.CreatedBy))))

                             group a by a.ListCode into g
                             select new
                             {
                                 ListCode = g.Key,
                                 ListCard = g.Select(y => new
                                 {
                                     y.CardID,
                                     y.CardCode,
                                     y.CardName,
                                     y.Deadline,
                                     y.Quantitative,
                                     y.Unit,
                                     y.Currency,
                                     y.Status,
                                     BeginTime = y.BeginTime.ToString("dd/MM/yyyy"),
                                     EndTime = y.EndTime.HasValue ? y.EndTime.Value.ToString("dd/MM/yyyy") : "",
                                     y.Cost,
                                     y.Completed,
                                     y.LocationText,
                                 }).Distinct()
                             }).AsNoTracking();
                var list = (from a in query
                            join b in _context.WORKOSLists on a.ListCode equals b.ListCode
                            where b.IsDeleted == false
                            select new { a, b });
                var listPaging = list.Skip(intBeginFor).Take(data.Length).Select(x => new
                {
                    x.b.ListID,
                    x.b.ListCode,
                    x.b.ListName,
                    x.b.Completed,
                    x.b.WeightNum,
                    x.b.Status,
                    x.b.BeginTime,
                    x.b.Deadline,
                    x.b.Background,
                    x.b.Order,
                    ListCard = x.a.ListCard.Select(y => new
                    {
                        y.CardID,
                        y.CardCode,
                        y.CardName,
                        y.Deadline,
                        y.Quantitative,
                        y.Unit,
                        y.Currency,
                        CurrencyValue = _context.CommonSettings.FirstOrDefault(z => z.CodeSet == y.Currency).ValueSet ?? "",
                        y.BeginTime,
                        y.EndTime,
                        Status = _context.CommonSettings.FirstOrDefault(z => z.CodeSet == y.Status).ValueSet ?? "",
                        CountCheckListDone = _context.CardItemChecks.Where(z => z.CardCode == y.CardCode && z.Completed == 100 && z.Flag == false).Count(),
                        CountCheckList = _context.CardItemChecks.Where(z => z.CardCode == y.CardCode && z.Flag == false).Count(),
                        y.Cost,
                        y.Completed,
                        y.LocationText,
                    })
                });
                return new
                {
                    Data = listPaging,
                    Total = list.Count(),
                };
            }
        }


        [NonAction]
        public IQueryable<GridCardJtable> GetGirdCardCustomer(AdvanceSearchObj dataSearch)
        {
            IQueryable<GridCardJtable> query = null;
            if (dataSearch.ListObjCode.Any())
            {
                query = GetGirdCardInCustomer(dataSearch);
            }
            else
            {
                query = GetGirdCardOutCustomer(dataSearch);
            }
            return query;
        }

        [NonAction]
        public IQueryable<GridCardJtable> GetGirdCardInCustomer(AdvanceSearchObj dataSearch)
        {
            var session = HttpContext.GetSessionUser();
            var user = _context.Users.FirstOrDefault(x => x.Active && x.UserName == ESEIM.AppContext.UserName);
            var fromDate = string.IsNullOrEmpty(dataSearch.FromDate) ? (DateTime?)null : DateTime.ParseExact(dataSearch.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var toDate = string.IsNullOrEmpty(dataSearch.ToDate) ? (DateTime?)null : DateTime.ParseExact(dataSearch.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var query = (from a in _context.WORKOSCards.Where(x => !x.IsDeleted)
                         let lt = a.LstUser.Split(",", StringSplitOptions.None)
                         join c in _context.Users on a.CreatedBy equals c.UserName into c1
                         from c2 in c1.DefaultIfEmpty()
                         join g in _context.CardMappings on a.CardCode equals g.CardCode into g1
                         from g2 in g1.DefaultIfEmpty()
                         join h in _context.Users.Where(x => x.Active) on a.CreatedBy equals h.UserName into h1
                         from h2 in h1.DefaultIfEmpty()
                         join i in _context.WORKOSLists.Where(x => !x.IsDeleted) on a.ListCode equals i.ListCode
                         join k in _context.WORKOSBoards.Where(x => !x.IsDeleted) on i.BoardCode equals k.BoardCode
                         join b in _context.JcObjectIdRelatives.Where(x => !x.IsDeleted && dataSearch.ListObjCode.Any(y => y.Code == x.ObjID)) on a.CardCode equals b.CardCode
                         where (fromDate == null || a.BeginTime.Date >= fromDate) &&
                               (toDate == null || (a.EndTime.HasValue ? a.EndTime.Value.Date : DateTime.Now.Date) <= toDate) &&
                               ((string.IsNullOrEmpty(dataSearch.Status) && a.Status != "TRASH") || a.Status.Equals(dataSearch.Status)) &&
                               (string.IsNullOrEmpty(dataSearch.BranchId) || c2.BranchId.Equals(dataSearch.BranchId)) &&
                               ((string.IsNullOrEmpty(dataSearch.CardName) || a.CardCode.ToLower().Contains(dataSearch.CardName.ToLower())) || (string.IsNullOrEmpty(dataSearch.CardName) || a.CardName.ToUpper().Contains(dataSearch.CardName.ToUpper())))
                               //&& (session.IsAllData || g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(a.LstUser) && lt.Any(y => session.UserId == y)) || a.CreatedBy == session.UserName)
                               && (session.IsAllData
                                || (session.IsUser && (g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(a.LstUser) && lt.Any(y => session.UserId == y)) || a.CreatedBy == session.UserName))
                                || (session.IsBranch && (!string.IsNullOrEmpty(a.LstUser) && lt.Any(k => k == session.UserId) || a.CreatedBy == session.UserName || session.ListUserOfBranch.Count() > 0 && session.ListUserOfBranch.Any(k => k == a.CreatedBy))))
                         select new GridCardJtable
                         {
                             CardID = a.CardID,
                             CardCode = a.CardCode,
                             CardName = a.CardName,
                             ListName = _context.WORKOSLists.FirstOrDefault(y => y.ListCode.Equals(a.ListCode)).ListName ?? "",
                             BoardName = k.BoardName,
                             Deadline = a.Deadline,
                             Currency = _context.CommonSettings.FirstOrDefault(y => y.CodeSet == a.Currency).ValueSet ?? "",
                             Cost = a.Cost,
                             Completed = a.Completed,
                             BeginTime = a.BeginTime,
                             EndTime = a.EndTime,
                             Status = _context.CommonSettings.FirstOrDefault(y => y.CodeSet.Equals(a.Status)).ValueSet,
                             UpdateTime = a.UpdatedTime,
                             CreatedBy = h2.GivenName,
                             CreatedTime = a.CreatedDate.ToString("dd/MM/yyyy"),
                             CreatedDate = a.CreatedDate,
                             UpdatedTimeTxt = a.UpdatedTime.HasValue ? a.UpdatedTime.Value.ToString("dd/MM/yyyy HH:mm:ss") : "",
                             WorkType = !string.IsNullOrEmpty(a.WorkType) ? _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.WorkType).ValueSet : "",
                             Priority = !string.IsNullOrEmpty(a.CardLevel) ? _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.CardLevel).ValueSet : "",
                         }).DistinctBy(x => x.CardCode).OrderByDescending(x => x.UpdateTime.HasValue ? x.UpdateTime.Value : x.CreatedDate).ThenByDescending(x => x.CardID);
            IQueryable<GridCardJtable> data1 = query.AsQueryable<GridCardJtable>();
            return data1;
        }

        [NonAction]
        public IQueryable<GridCardJtable> GetGirdCardOutCustomer(AdvanceSearchObj dataSearch)
        {
            return GetGirdCardOut(dataSearch);
        }
        #endregion

        #region Contract
        [HttpGet]
        public object GetListPageContract(int page, int length, string name)
        {
            var session = HttpContext.GetSessionUser();
            var user = _context.Users.FirstOrDefault(x => x.Active && x.UserName == ESEIM.AppContext.UserName);
            int intBeginFor = (page - 1) * length;
            var count = _context.PoSaleHeaders.Where(x => (string.IsNullOrEmpty(name) || x.Title.ToLower().Contains(name.ToLower())) && x.IsDeleted == false && session.IsAllData || session.ListContract.Any(p => p.Equals(x.ContractCode))).Count();
            var data = _context.PoSaleHeaders.Where(x => (string.IsNullOrEmpty(name) || (x.Title.ToLower().Contains(name.ToLower()))) &&
              (x.IsDeleted == false) && (session.IsAllData || session.ListContract.Any(p => p.Equals(x.ContractCode)))).OrderByDescending(x => x.ContractHeaderID).Skip(intBeginFor).Take(length).Select(x => new PageProjectModel
              {
                  Id = x.ContractHeaderID,
                  Code = x.ContractCode,
                  Name = x.Title,
                  CreatedTime = x.CreatedTime,
                  PercentObject = 0,
                  CountWork = (from a in _context.JcObjectIdRelatives.Where(k => !k.IsDeleted)
                               join b in _context.WORKOSCards.Where(k => k.Status != "TRASH") on a.CardCode equals b.CardCode
                               let lt = b.LstUser.Split(",", StringSplitOptions.None)
                               join g in _context.CardMappings on b.CardCode equals g.CardCode into g1
                               from g2 in g1.DefaultIfEmpty()
                               where a.ObjID == x.ContractCode && b.IsDeleted == false
                               //(session.IsAllData || g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(b.LstUser) && lt.Any(y => session.UserId == y)) || b.CreatedBy == session.UserName)
                               && (session.IsAllData
|| (session.IsUser && (g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(b.LstUser) && lt.Any(y => session.UserId == y)) || b.CreatedBy == session.UserName))
|| (session.IsBranch && (!string.IsNullOrEmpty(b.LstUser) && lt.Any(k => k == session.UserId) || b.CreatedBy == session.UserName || session.ListUserOfBranch.Count() > 0 && session.ListUserOfBranch.Any(k => k == b.CreatedBy))))
                               select new
                               {
                                   b.CardID,
                                   b.CardCode
                               }).Distinct().Count(),
                  IsCheck = false
              }).ToList();
            for (var i = 0; i < data.Count(); i++)
            {
                data[i].PercentObject = _cardService.GetPercentJCObject("CONTRACT", data[i].Code);
            }
            return (new
            {
                Tab = "Hợp đồng",
                Icon = "fa fa-suitcase",
                Total = count,
                ListData = data,
            });
        }

        [HttpPost]
        public JsonResult GetCardWithContract([FromBody]AdvanceSearchObj data)
        {
            if (data.ListObjCode.Any())
            {
                return Json(GetCardDataInContract(data));
            }
            else
            {
                return Json(GetCardDataOutContract(data));
            }
        }
        [NonAction]
        public object GetCardDataInContract(AdvanceSearchObj data)
        {
            var session = HttpContext.GetSessionUser();
            var user = _context.Users.FirstOrDefault(x => x.Active && x.UserName == ESEIM.AppContext.UserName);
            int intBeginFor = (data.Page - 1) * data.Length;
            var fromDate = string.IsNullOrEmpty(data.FromDate) ? (DateTime?)null : DateTime.ParseExact(data.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var toDate = string.IsNullOrEmpty(data.ToDate) ? (DateTime?)null : DateTime.ParseExact(data.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var query = (from a in _context.JcObjectIdRelatives.Where(x => x.ObjTypeCode == "CONTRACT" && !x.IsDeleted)
                         join b in _context.WORKOSCards on a.CardCode equals b.CardCode
                         let lt = b.LstUser.Split(",", StringSplitOptions.None)
                         join g in _context.CardMappings on b.CardCode equals g.CardCode into g1
                         from g2 in g1.DefaultIfEmpty()
                         join c in _context.Users.Where(x => x.Active) on b.CreatedBy equals c.UserName
                         where data.ListObjCode.Any(x => x.Code == a.ObjID) &&
                         (fromDate == null || b.BeginTime >= fromDate) &&
                         (toDate == null || (b.EndTime.HasValue ? b.EndTime.Value.Date : DateTime.Now.Date) <= toDate) &&
                         (string.IsNullOrEmpty(data.Status) || (!string.IsNullOrEmpty(b.Status) && b.Status.Equals(data.Status))) &&
                         (string.IsNullOrEmpty(data.BranchId) || (!string.IsNullOrEmpty(c.BranchId) && c.BranchId.Equals(data.BranchId))) &&
                         (string.IsNullOrEmpty(data.CardName) || b.CardName.ToUpper().Contains(data.CardName.ToUpper())) &&
                         b.IsDeleted == false
                         //(session.IsAllData || g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(b.LstUser) && lt.Any(y => session.UserId == y)) || b.CreatedBy == session.UserName)
                         && (session.IsAllData
                        || (session.IsUser && (g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(b.LstUser) && lt.Any(y => session.UserId == y)) || b.CreatedBy == session.UserName))
                        || (session.IsBranch && (!string.IsNullOrEmpty(b.LstUser) && lt.Any(k => k == session.UserId) || b.CreatedBy == session.UserName || session.ListUserOfBranch.Count() > 0 && session.ListUserOfBranch.Any(k => k == b.CreatedBy))))

                         group b by b.ListCode into g
                         select new
                         {
                             ListCode = g.Key,
                             ListCard = g.Select(y => new
                             {
                                 y.CardID,
                                 y.CardCode,
                                 y.CardName,
                                 y.Deadline,
                                 y.Quantitative,
                                 y.Unit,
                                 y.Currency,
                                 y.Status,
                                 BeginTime = y.BeginTime.ToString("dd/MM/yyyy"),
                                 EndTime = y.EndTime.HasValue ? y.EndTime.Value.ToString("dd/MM/yyyy") : "",
                                 y.Cost,
                                 y.Completed,
                                 y.LocationText,
                             }).Distinct()
                         }).AsNoTracking();
            var list = (from a in query
                        join b in _context.WORKOSLists on a.ListCode equals b.ListCode
                        where b.IsDeleted == false
                        select new { a, b });
            var listPaging = list.Skip(intBeginFor).Take(data.Length).Select(x => new
            {
                x.b.ListID,
                x.b.ListCode,
                x.b.ListName,
                x.b.Completed,
                x.b.WeightNum,
                x.b.Status,
                x.b.BeginTime,
                x.b.Deadline,
                x.b.Background,
                x.b.Order,
                ListCard = x.a.ListCard.Select(y => new
                {
                    y.CardID,
                    y.CardCode,
                    y.CardName,
                    y.Deadline,
                    y.Quantitative,
                    y.Unit,
                    y.Currency,
                    CurrencyValue = _context.CommonSettings.FirstOrDefault(z => z.CodeSet == y.Currency).ValueSet ?? "",
                    y.BeginTime,
                    y.EndTime,
                    Status = _context.CommonSettings.FirstOrDefault(z => z.CodeSet == y.Status).ValueSet ?? "",
                    CountCheckListDone = _context.CardItemChecks.Where(z => z.CardCode == y.CardCode && z.Completed == 100 && z.Flag == false).Count(),
                    CountCheckList = _context.CardItemChecks.Where(z => z.CardCode == y.CardCode && z.Flag == false).Count(),
                    y.Cost,
                    y.Completed,
                    y.LocationText,
                })
            });
            return new
            {
                Data = listPaging,
                Total = list.Count(),
            };
        }

        [NonAction]
        public object GetCardDataOutContract(AdvanceSearchObj data)
        {
            var session = HttpContext.GetSessionUser();
            var user = _context.Users.FirstOrDefault(x => x.Active && x.UserName == ESEIM.AppContext.UserName);
            int intBeginFor = (data.Page - 1) * data.Length;
            var fromDate = string.IsNullOrEmpty(data.FromDate) ? (DateTime?)null : DateTime.ParseExact(data.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var toDate = string.IsNullOrEmpty(data.ToDate) ? (DateTime?)null : DateTime.ParseExact(data.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            //danh sách card mới,thẻ mới
            if (fromDate == null && toDate == null && string.IsNullOrEmpty(data.CardName) && string.IsNullOrEmpty(data.Status) && string.IsNullOrEmpty(data.BranchId))
            {
                var query = (from a in _context.WORKOSCards
                             let lt = a.LstUser.Split(",", StringSplitOptions.None)
                             join g in _context.CardMappings on a.CardCode equals g.CardCode into g1
                             from g2 in g1.DefaultIfEmpty()
                             where a.CreatedDate.Date == DateTime.Today && a.IsDeleted == false
                             //(session.IsAllData || g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(a.LstUser) && lt.Any(y => session.UserId == y)) || a.CreatedBy == session.UserName)
                             && (session.IsAllData
                            || (session.IsUser && (g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(a.LstUser) && lt.Any(y => session.UserId == y)) || a.CreatedBy == session.UserName))
                            || (session.IsBranch && (!string.IsNullOrEmpty(a.LstUser) && lt.Any(k => k == session.UserId) || a.CreatedBy == session.UserName || session.ListUserOfBranch.Count() > 0 && session.ListUserOfBranch.Any(k => k == a.CreatedBy))))

                             group a by a.ListCode into g
                             select new
                             {
                                 ListCode = g.Key,
                             }).AsNoTracking();
                var list = (from a in _context.WORKOSLists
                            from b in query
                            where ((a.ListCode == b.ListCode) || (a.CreatedDate.Date == DateTime.Today) && a.IsDeleted == false)
                            select a).Distinct().AsNoTracking();
                var listPaging = list.Skip(intBeginFor).Take(data.Length).Select(x => new
                {
                    x.ListID,
                    x.ListCode,
                    x.ListName,
                    x.Completed,
                    x.WeightNum,
                    x.Status,
                    x.BeginTime,
                    x.Deadline,
                    x.Background,
                    x.Order,
                    ListCard = _context.WORKOSCards.Where(y => y.ListCode == x.ListCode && y.CreatedDate.Date == DateTime.Today && y.IsDeleted == false).Select(y => new
                    {
                        y.CardID,
                        y.CardCode,
                        y.CardName,
                        y.Deadline,
                        y.Quantitative,
                        y.Unit,
                        y.Currency,
                        CurrencyValue = _context.CommonSettings.FirstOrDefault(z => z.CodeSet == y.Currency).ValueSet ?? "",
                        BeginTime = y.BeginTime.ToString("dd/MM/yyyy"),
                        EndTime = y.EndTime.HasValue ? y.EndTime.Value.ToString("dd/MM/yyyy") : "",
                        Status = _context.CommonSettings.FirstOrDefault(z => z.CodeSet == y.Status).ValueSet ?? "",
                        CountCheckListDone = _context.CardItemChecks.Where(z => z.CardCode == y.CardCode && z.Completed == 100 && z.Flag == false).Count(),
                        CountCheckList = _context.CardItemChecks.Where(z => z.CardCode == y.CardCode && z.Flag == false).Count(),
                        y.Cost,
                        y.Completed,
                        y.LocationText,
                    }).Distinct()
                });
                return new
                {
                    Data = listPaging,
                    Total = list.Count(),
                };
            }
            else
            {
                var query = (from a in _context.WORKOSCards
                             let lt = a.LstUser.Split(",", StringSplitOptions.None)
                             join g in _context.CardMappings on a.CardCode equals g.CardCode into g1
                             from g2 in g1.DefaultIfEmpty()
                             join b in _context.Users.Where(x => x.Active) on a.CreatedBy equals b.UserName
                             where (fromDate == null || a.BeginTime >= fromDate) &&
                             (toDate == null || (a.EndTime.HasValue ? a.EndTime.Value.Date : DateTime.Now.Date) <= toDate) &&
                             (string.IsNullOrEmpty(data.Status) || a.Status.Equals(data.Status)) &&
                             (string.IsNullOrEmpty(data.BranchId) || b.BranchId.Equals(data.BranchId)) &&
                             (string.IsNullOrEmpty(data.CardName) || a.CardName.ToUpper().Contains(data.CardName.ToUpper())) &&
                             a.IsDeleted == false
                             //(session.IsAllData || g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(a.LstUser) && lt.Any(y => session.UserId == y)) || a.CreatedBy == session.UserName)
                             && (session.IsAllData
                            || (session.IsUser && (g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(a.LstUser) && lt.Any(y => session.UserId == y)) || a.CreatedBy == session.UserName))
                            || (session.IsBranch && (!string.IsNullOrEmpty(a.LstUser) && lt.Any(k => k == session.UserId) || a.CreatedBy == session.UserName || session.ListUserOfBranch.Count() > 0 && session.ListUserOfBranch.Any(k => k == a.CreatedBy))))

                             group a by a.ListCode into g
                             select new
                             {
                                 ListCode = g.Key,
                                 ListCard = g.Select(y => new
                                 {
                                     y.CardID,
                                     y.CardCode,
                                     y.CardName,
                                     y.Deadline,
                                     y.Quantitative,
                                     y.Unit,
                                     y.Currency,
                                     y.Status,
                                     BeginTime = y.BeginTime.ToString("dd/MM/yyyy"),
                                     EndTime = y.EndTime.HasValue ? y.EndTime.Value.ToString("dd/MM/yyyy") : "",
                                     y.Cost,
                                     y.Completed,
                                     y.LocationText,
                                 }).Distinct()
                             }).AsNoTracking();
                var list = (from a in query
                            join b in _context.WORKOSLists on a.ListCode equals b.ListCode
                            where b.IsDeleted == false
                            select new { a, b });
                var listPaging = list.Skip(intBeginFor).Take(data.Length).Select(x => new
                {
                    x.b.ListID,
                    x.b.ListCode,
                    x.b.ListName,
                    x.b.Completed,
                    x.b.WeightNum,
                    x.b.Status,
                    x.b.BeginTime,
                    x.b.Deadline,
                    x.b.Background,
                    x.b.Order,
                    ListCard = x.a.ListCard.Select(y => new
                    {
                        y.CardID,
                        y.CardCode,
                        y.CardName,
                        y.Deadline,
                        y.Quantitative,
                        y.Unit,
                        y.Currency,
                        CurrencyValue = _context.CommonSettings.FirstOrDefault(z => z.CodeSet == y.Currency).ValueSet ?? "",
                        y.BeginTime,
                        y.EndTime,
                        Status = _context.CommonSettings.FirstOrDefault(z => z.CodeSet == y.Status).ValueSet ?? "",
                        CountCheckListDone = _context.CardItemChecks.Where(z => z.CardCode == y.CardCode && z.Completed == 100 && z.Flag == false).Count(),
                        CountCheckList = _context.CardItemChecks.Where(z => z.CardCode == y.CardCode && z.Flag == false).Count(),
                        y.Cost,
                        y.Completed,
                        y.LocationText,
                    })
                });
                return new
                {
                    Data = listPaging,
                    Total = list.Count(),
                };
            }
        }

        [NonAction]
        public IQueryable<GridCardJtable> GetGirdCardContract(AdvanceSearchObj dataSearch)
        {
            IQueryable<GridCardJtable> query = null;
            if (dataSearch.ListObjCode.Any())
            {
                query = GetGirdCardInContract(dataSearch);
            }
            else
            {
                query = GetGirdCardOutContract(dataSearch);
            }
            return query;
        }

        [NonAction]
        public IQueryable<GridCardJtable> GetGirdCardInContract(AdvanceSearchObj dataSearch)
        {
            var session = HttpContext.GetSessionUser();
            var user = _context.Users.FirstOrDefault(x => x.Active && x.UserName == ESEIM.AppContext.UserName);
            var fromDate = string.IsNullOrEmpty(dataSearch.FromDate) ? (DateTime?)null : DateTime.ParseExact(dataSearch.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var toDate = string.IsNullOrEmpty(dataSearch.ToDate) ? (DateTime?)null : DateTime.ParseExact(dataSearch.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var query = (from a in _context.WORKOSCards.Where(x => !x.IsDeleted)
                         let lt = a.LstUser.Split(",", StringSplitOptions.None)
                         join c in _context.Users on a.CreatedBy equals c.UserName into c1
                         from c2 in c1.DefaultIfEmpty()
                         join g in _context.CardMappings on a.CardCode equals g.CardCode into g1
                         from g2 in g1.DefaultIfEmpty()
                         join h in _context.Users.Where(x => x.Active) on a.CreatedBy equals h.UserName into h1
                         from h2 in h1.DefaultIfEmpty()
                         join i in _context.WORKOSLists.Where(x => !x.IsDeleted) on a.ListCode equals i.ListCode
                         join k in _context.WORKOSBoards.Where(x => !x.IsDeleted) on i.BoardCode equals k.BoardCode
                         join b in _context.JcObjectIdRelatives.Where(x => dataSearch.ListObjCode.Any(y => y.Code == x.ObjID) && !x.IsDeleted) on a.CardCode equals b.CardCode
                         where (fromDate == null || a.BeginTime.Date >= fromDate) &&
                               (toDate == null || (a.EndTime.HasValue ? a.EndTime.Value.Date : DateTime.Now.Date) <= toDate) &&
                               ((string.IsNullOrEmpty(dataSearch.Status) && a.Status != "TRASH") || a.Status.Equals(dataSearch.Status)) &&
                               (string.IsNullOrEmpty(dataSearch.BranchId) || c2.BranchId.Equals(dataSearch.BranchId)) &&
                               ((string.IsNullOrEmpty(dataSearch.CardName) || a.CardCode.ToLower().Contains(dataSearch.CardName.ToLower())) || (string.IsNullOrEmpty(dataSearch.CardName) || a.CardName.ToUpper().Contains(dataSearch.CardName.ToUpper())))
                               //&& (session.IsAllData || g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(a.LstUser) && lt.Any(y => session.UserId == y)) || a.CreatedBy == session.UserName)
                               && (session.IsAllData
                                || (session.IsUser && (g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(a.LstUser) && lt.Any(y => session.UserId == y)) || a.CreatedBy == session.UserName))
                                || (session.IsBranch && (!string.IsNullOrEmpty(a.LstUser) && lt.Any(k => k == session.UserId) || a.CreatedBy == session.UserName || session.ListUserOfBranch.Count() > 0 && session.ListUserOfBranch.Any(k => k == a.CreatedBy))))
                         select new GridCardJtable
                         {
                             CardID = a.CardID,
                             CardCode = a.CardCode,
                             CardName = a.CardName,
                             ListName = _context.WORKOSLists.FirstOrDefault(y => y.ListCode.Equals(a.ListCode)).ListName ?? "",
                             BoardName = k.BoardName,
                             Deadline = a.Deadline,
                             Currency = _context.CommonSettings.FirstOrDefault(y => y.CodeSet == a.Currency).ValueSet ?? "",
                             Cost = a.Cost,
                             Completed = a.Completed,
                             BeginTime = a.BeginTime,
                             EndTime = a.EndTime,
                             Status = _context.CommonSettings.FirstOrDefault(y => y.CodeSet.Equals(a.Status)).ValueSet,
                             UpdateTime = a.UpdatedTime,
                             CreatedBy = h2.GivenName,
                             CreatedTime = a.CreatedDate.ToString("dd/MM/yyyy"),
                             CreatedDate = a.CreatedDate,
                             UpdatedTimeTxt = a.UpdatedTime.HasValue ? a.UpdatedTime.Value.ToString("dd/MM/yyyy HH:mm:ss") : "",
                             WorkType = !string.IsNullOrEmpty(a.WorkType) ? _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.WorkType).ValueSet : "",
                             Priority = !string.IsNullOrEmpty(a.CardLevel) ? _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.CardLevel).ValueSet : "",
                         }).DistinctBy(x => x.CardCode).OrderByDescending(x => x.UpdateTime.HasValue ? x.UpdateTime.Value : x.CreatedDate).ThenByDescending(x => x.CardID);
            IQueryable<GridCardJtable> data1 = query.AsQueryable<GridCardJtable>();
            return data1;
        }

        [NonAction]
        public IQueryable<GridCardJtable> GetGirdCardOutContract(AdvanceSearchObj dataSearch)
        {
            return GetGirdCardOut(dataSearch);
        }
        #endregion

        #region Supplier
        [HttpGet]
        public object GetListPageSupplier(int page, int length, string name)
        {
            var session = HttpContext.GetSessionUser();
            var user = _context.Users.FirstOrDefault(x => x.Active && x.UserName == ESEIM.AppContext.UserName);
            int intBeginFor = (page - 1) * length;
            var count = _context.Suppliers.Where(x => (string.IsNullOrEmpty(name) || x.SupName.ToLower().Contains(name.ToLower())) && x.IsDeleted == false).Count();
            var data = _context.Suppliers.Where(x => (string.IsNullOrEmpty(name) || (x.SupName.ToLower().Contains(name.ToLower()))) &&
              (x.IsDeleted == false)).OrderByDescending(x => x.SupID).Skip(intBeginFor).Take(length).Select(x => new
              {
                  Id = x.SupID,
                  Code = x.SupCode,
                  Name = x.SupName,
                  x.CreatedTime,
                  CountWork = (from a in _context.JcObjectIdRelatives.Where(k => k.ObjTypeCode == "SUPPLIER" && !x.IsDeleted)
                               join b in _context.WORKOSCards.Where(k => k.Status != "TRASH") on a.CardCode equals b.CardCode
                               let lt = b.LstUser.Split(",", StringSplitOptions.None)
                               join g in _context.CardMappings on b.CardCode equals g.CardCode into g1
                               from g2 in g1.DefaultIfEmpty()
                               where a.ObjID == x.SupCode && b.IsDeleted == false &&
                               //(session.IsAllData || g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(b.LstUser) && lt.Any(y => session.UserId == y)) || b.CreatedBy == session.UserName)
                               (session.IsAllData
|| (session.IsUser && (g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(b.LstUser) && lt.Any(y => session.UserId == y)) || b.CreatedBy == session.UserName))
|| (session.IsBranch && (!string.IsNullOrEmpty(b.LstUser) && lt.Any(k => k == session.UserId) || b.CreatedBy == session.UserName || session.ListUserOfBranch.Count() > 0 && session.ListUserOfBranch.Any(k => k == b.CreatedBy))))
                               select new
                               {
                                   b.CardID,
                                   b.CardCode
                               }).Distinct().Count(),
                  IsCheck = false
              });
            return (new
            {
                Tab = "Nhà cung cấp",
                Icon = "fas fa-user",
                Total = count,
                ListData = data,
            });
        }

        [HttpPost]
        public JsonResult GetCardWithSupplier([FromBody]AdvanceSearchObj data)
        {
            if (data.ListObjCode.Any())
            {
                return Json(GetCardDataInSupplier(data));
            }
            else
            {
                return Json(GetCardDataOutSupplier(data));
            }
        }

        [NonAction]
        public object GetCardDataInSupplier(AdvanceSearchObj data)
        {
            var session = HttpContext.GetSessionUser();
            var user = _context.Users.FirstOrDefault(x => x.Active && x.UserName == ESEIM.AppContext.UserName);
            int intBeginFor = (data.Page - 1) * data.Length;
            var fromDate = string.IsNullOrEmpty(data.FromDate) ? (DateTime?)null : DateTime.ParseExact(data.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var toDate = string.IsNullOrEmpty(data.ToDate) ? (DateTime?)null : DateTime.ParseExact(data.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var query = (from a in _context.JcObjectIdRelatives.Where(x => x.ObjTypeCode == "SUPPLIER" && !x.IsDeleted)
                         join b in _context.WORKOSCards.Where(x => !x.IsDeleted) on a.CardCode equals b.CardCode
                         let lt = b.LstUser.Split(",", StringSplitOptions.None)
                         join g in _context.CardMappings on b.CardCode equals g.CardCode into g1
                         from g2 in g1.DefaultIfEmpty()
                         join c in _context.Users.Where(x => x.Active) on b.CreatedBy equals c.UserName
                         where data.ListObjCode.Any(x => x.Code == a.ObjID) &&
                         (fromDate == null || b.BeginTime >= fromDate) &&
                         (toDate == null || (b.EndTime.HasValue ? b.EndTime.Value.Date : DateTime.Now.Date) <= toDate) &&
                         (string.IsNullOrEmpty(data.Status) || (!string.IsNullOrEmpty(b.Status) && b.Status.Equals(data.Status))) &&
                         (string.IsNullOrEmpty(data.BranchId) || (!string.IsNullOrEmpty(c.BranchId) && c.BranchId.Equals(data.BranchId))) &&
                         (string.IsNullOrEmpty(data.CardName) || b.CardName.ToUpper().Contains(data.CardName.ToUpper()))
                         //(session.IsAllData || g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(b.LstUser) && lt.Any(y => session.UserId == y)) || b.CreatedBy == session.UserName)
                         && (session.IsAllData
                        || (session.IsUser && (g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(b.LstUser) && lt.Any(y => session.UserId == y)) || b.CreatedBy == session.UserName))
                        || (session.IsBranch && (!string.IsNullOrEmpty(b.LstUser) && lt.Any(k => k == session.UserId) || b.CreatedBy == session.UserName || session.ListUserOfBranch.Count() > 0 && session.ListUserOfBranch.Any(k => k == b.CreatedBy))))

                         group b by b.ListCode into g
                         select new
                         {
                             ListCode = g.Key,
                             ListCard = g.Select(y => new
                             {
                                 y.CardID,
                                 y.CardCode,
                                 y.CardName,
                                 y.Deadline,
                                 y.Quantitative,
                                 y.Unit,
                                 y.Currency,
                                 y.Status,
                                 BeginTime = y.BeginTime.ToString("dd/MM/yyyy"),
                                 EndTime = y.EndTime.HasValue ? y.EndTime.Value.ToString("dd/MM/yyyy") : "",
                                 y.Cost,
                                 y.Completed,
                                 y.LocationText,
                             }).Distinct()
                         }).AsNoTracking();
            var list = (from a in query
                        join b in _context.WORKOSLists on a.ListCode equals b.ListCode
                        where b.IsDeleted == false
                        select new { a, b });
            var listPaging = list.Skip(intBeginFor).Take(data.Length).Select(x => new
            {
                x.b.ListID,
                x.b.ListCode,
                x.b.ListName,
                x.b.Completed,
                x.b.WeightNum,
                x.b.Status,
                x.b.BeginTime,
                x.b.Deadline,
                x.b.Background,
                x.b.Order,
                ListCard = x.a.ListCard.Select(y => new
                {
                    y.CardID,
                    y.CardCode,
                    y.CardName,
                    y.Deadline,
                    y.Quantitative,
                    y.Unit,
                    y.Currency,
                    CurrencyValue = _context.CommonSettings.FirstOrDefault(z => z.CodeSet == y.Currency).ValueSet ?? "",
                    y.BeginTime,
                    y.EndTime,
                    Status = _context.CommonSettings.FirstOrDefault(z => z.CodeSet == y.Status).ValueSet ?? "",
                    CountCheckListDone = _context.CardItemChecks.Where(z => z.CardCode == y.CardCode && z.Completed == 100 && z.Flag == false).Count(),
                    CountCheckList = _context.CardItemChecks.Where(z => z.CardCode == y.CardCode && z.Flag == false).Count(),
                    y.Cost,
                    y.Completed,
                    y.LocationText,
                })
            });
            return new
            {
                Data = listPaging,
                Total = list.Count(),
            };
        }

        [NonAction]
        public object GetCardDataOutSupplier(AdvanceSearchObj data)
        {
            var session = HttpContext.GetSessionUser();
            var user = _context.Users.FirstOrDefault(x => x.Active && x.UserName == ESEIM.AppContext.UserName);
            int intBeginFor = (data.Page - 1) * data.Length;
            var fromDate = string.IsNullOrEmpty(data.FromDate) ? (DateTime?)null : DateTime.ParseExact(data.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var toDate = string.IsNullOrEmpty(data.ToDate) ? (DateTime?)null : DateTime.ParseExact(data.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            //danh sách card mới,thẻ mới
            if (fromDate == null && toDate == null && string.IsNullOrEmpty(data.CardName) && string.IsNullOrEmpty(data.Status) && string.IsNullOrEmpty(data.BranchId))
            {
                var query = (from a in _context.WORKOSCards
                             let lt = a.LstUser.Split(",", StringSplitOptions.None)
                             join g in _context.CardMappings on a.CardCode equals g.CardCode into g1
                             from g2 in g1.DefaultIfEmpty()
                             where a.CreatedDate.Date == DateTime.Today && a.IsDeleted == false
                             //(session.IsAllData || g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(a.LstUser) && lt.Any(y => session.UserId == y)) || a.CreatedBy == session.UserName)
                             && (session.IsAllData
                            || (session.IsUser && (g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(a.LstUser) && lt.Any(y => session.UserId == y)) || a.CreatedBy == session.UserName))
                            || (session.IsBranch && (!string.IsNullOrEmpty(a.LstUser) && lt.Any(k => k == session.UserId) || a.CreatedBy == session.UserName || session.ListUserOfBranch.Count() > 0 && session.ListUserOfBranch.Any(k => k == a.CreatedBy))))

                             group a by a.ListCode into g
                             select new
                             {
                                 ListCode = g.Key,
                             }).AsNoTracking();
                var list = (from a in _context.WORKOSLists
                            from b in query
                            where ((a.ListCode == b.ListCode) || (a.CreatedDate.Date == DateTime.Today) && a.IsDeleted == false)
                            select a).Distinct().AsNoTracking();
                var listPaging = list.Skip(intBeginFor).Take(data.Length).Select(x => new
                {
                    x.ListID,
                    x.ListCode,
                    x.ListName,
                    x.Completed,
                    x.WeightNum,
                    x.Status,
                    x.BeginTime,
                    x.Deadline,
                    x.Background,
                    x.Order,
                    ListCard = _context.WORKOSCards.Where(y => y.ListCode == x.ListCode && y.CreatedDate.Date == DateTime.Today && y.IsDeleted == false).Select(y => new
                    {
                        y.CardID,
                        y.CardCode,
                        y.CardName,
                        y.Deadline,
                        y.Quantitative,
                        y.Unit,
                        y.Currency,
                        CurrencyValue = _context.CommonSettings.FirstOrDefault(z => z.CodeSet == y.Currency).ValueSet ?? "",
                        BeginTime = y.BeginTime.ToString("dd/MM/yyyy"),
                        EndTime = y.EndTime.HasValue ? y.EndTime.Value.ToString("dd/MM/yyyy") : "",
                        Status = _context.CommonSettings.FirstOrDefault(z => z.CodeSet == y.Status).ValueSet ?? "",
                        CountCheckListDone = _context.CardItemChecks.Where(z => z.CardCode == y.CardCode && z.Completed == 100 && z.Flag == false).Count(),
                        CountCheckList = _context.CardItemChecks.Where(z => z.CardCode == y.CardCode && z.Flag == false).Count(),
                        y.Cost,
                        y.Completed,
                        y.LocationText,
                    }).Distinct()
                });
                return new
                {
                    Data = listPaging,
                    Total = list.Count(),
                };
            }
            else
            {
                var query = (from a in _context.WORKOSCards
                             let lt = a.LstUser.Split(",", StringSplitOptions.None)
                             join g in _context.CardMappings on a.CardCode equals g.CardCode into g1
                             from g2 in g1.DefaultIfEmpty()
                             join b in _context.Users.Where(x => x.Active) on a.CreatedBy equals b.UserName
                             where (fromDate == null || a.BeginTime >= fromDate) &&
                             (toDate == null || (a.EndTime.HasValue ? a.EndTime.Value.Date : DateTime.Now.Date) <= toDate) &&
                             (string.IsNullOrEmpty(data.Status) || a.Status.Equals(data.Status)) &&
                             (string.IsNullOrEmpty(data.BranchId) || b.BranchId.Equals(data.BranchId)) &&
                             (string.IsNullOrEmpty(data.CardName) || a.CardName.ToUpper().Contains(data.CardName.ToUpper())) &&
                             a.IsDeleted == false
                             //(session.IsAllData || g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(a.LstUser) && lt.Any(y => session.UserId == y)) || a.CreatedBy == session.UserName)
                             && (session.IsAllData
                            || (session.IsUser && (g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(a.LstUser) && lt.Any(y => session.UserId == y)) || a.CreatedBy == session.UserName))
                            || (session.IsBranch && (!string.IsNullOrEmpty(a.LstUser) && lt.Any(k => k == session.UserId) || a.CreatedBy == session.UserName || session.ListUserOfBranch.Count() > 0 && session.ListUserOfBranch.Any(k => k == a.CreatedBy))))

                             group a by a.ListCode into g
                             select new
                             {
                                 ListCode = g.Key,
                                 ListCard = g.Select(y => new
                                 {
                                     y.CardID,
                                     y.CardCode,
                                     y.CardName,
                                     y.Deadline,
                                     y.Quantitative,
                                     y.Unit,
                                     y.Currency,
                                     y.Status,
                                     BeginTime = y.BeginTime.ToString("dd/MM/yyyy"),
                                     EndTime = y.EndTime.HasValue ? y.EndTime.Value.ToString("dd/MM/yyyy") : "",
                                     y.Cost,
                                     y.Completed,
                                     y.LocationText,
                                 }).Distinct()
                             }).AsNoTracking();
                var list = (from a in query
                            join b in _context.WORKOSLists on a.ListCode equals b.ListCode
                            where b.IsDeleted == false
                            select new { a, b });
                var listPaging = list.Skip(intBeginFor).Take(data.Length).Select(x => new
                {
                    x.b.ListID,
                    x.b.ListCode,
                    x.b.ListName,
                    x.b.Completed,
                    x.b.WeightNum,
                    x.b.Status,
                    x.b.BeginTime,
                    x.b.Deadline,
                    x.b.Background,
                    x.b.Order,
                    ListCard = x.a.ListCard.Select(y => new
                    {
                        y.CardID,
                        y.CardCode,
                        y.CardName,
                        y.Deadline,
                        y.Quantitative,
                        y.Unit,
                        y.Currency,
                        CurrencyValue = _context.CommonSettings.FirstOrDefault(z => z.CodeSet == y.Currency).ValueSet ?? "",
                        y.BeginTime,
                        y.EndTime,
                        Status = _context.CommonSettings.FirstOrDefault(z => z.CodeSet == y.Status).ValueSet ?? "",
                        CountCheckListDone = _context.CardItemChecks.Where(z => z.CardCode == y.CardCode && z.Completed == 100 && z.Flag == false).Count(),
                        CountCheckList = _context.CardItemChecks.Where(z => z.CardCode == y.CardCode && z.Flag == false).Count(),
                        y.Cost,
                        y.Completed,
                        y.LocationText,
                    })
                });
                return new
                {
                    Data = listPaging,
                    Total = list.Count(),
                };
            }
        }


        [NonAction]
        public IQueryable<GridCardJtable> GetGirdCardSupplier(AdvanceSearchObj dataSearch)
        {
            IQueryable<GridCardJtable> query = null;
            if (dataSearch.ListObjCode.Any())
            {
                query = GetGirdCardInSupplier(dataSearch);
            }
            else
            {
                query = GetGirdCardOutSupplier(dataSearch);
            }
            return query;
        }

        [NonAction]
        public IQueryable<GridCardJtable> GetGirdCardInSupplier(AdvanceSearchObj dataSearch)
        {
            var session = HttpContext.GetSessionUser();
            var user = _context.Users.FirstOrDefault(x => x.Active && x.UserName == ESEIM.AppContext.UserName);
            var fromDate = string.IsNullOrEmpty(dataSearch.FromDate) ? (DateTime?)null : DateTime.ParseExact(dataSearch.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var toDate = string.IsNullOrEmpty(dataSearch.ToDate) ? (DateTime?)null : DateTime.ParseExact(dataSearch.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var query = (from a in _context.WORKOSCards.Where(x => !x.IsDeleted)
                         join c in _context.Users on a.CreatedBy equals c.UserName into c1
                         from c2 in c1.DefaultIfEmpty()
                         let lt = a.LstUser.Split(",", StringSplitOptions.None)
                         join g in _context.CardMappings on a.CardCode equals g.CardCode into g1
                         from g2 in g1.DefaultIfEmpty()
                         join h in _context.Users.Where(x => x.Active) on a.CreatedBy equals h.UserName into h1
                         from h2 in h1.DefaultIfEmpty()
                         join i in _context.WORKOSLists.Where(x => !x.IsDeleted) on a.ListCode equals i.ListCode
                         join k in _context.WORKOSBoards.Where(x => !x.IsDeleted) on i.BoardCode equals k.BoardCode
                         join b in _context.JcObjectIdRelatives.Where(x => x.ObjTypeCode == "SUPPLIER" && dataSearch.ListObjCode.Any(y => y.Code == x.ObjID)) on a.CardCode equals b.CardCode
                         where (fromDate == null || a.BeginTime.Date >= fromDate) &&
                               (toDate == null || (a.EndTime.HasValue ? a.EndTime.Value.Date : DateTime.Now.Date) <= toDate) &&
                               ((string.IsNullOrEmpty(dataSearch.Status) && a.Status != "TRASH") || a.Status.Equals(dataSearch.Status)) &&
                               (string.IsNullOrEmpty(dataSearch.BranchId) || c2.BranchId.Equals(dataSearch.BranchId)) &&
                               ((string.IsNullOrEmpty(dataSearch.CardName) || a.CardCode.ToLower().Contains(dataSearch.CardName.ToLower())) || (string.IsNullOrEmpty(dataSearch.CardName) || a.CardName.ToUpper().Contains(dataSearch.CardName.ToUpper())))
                               //&& (session.IsAllData || g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(a.LstUser) && lt.Any(y => session.UserId == y)) || a.CreatedBy == session.UserName)
                               && (session.IsAllData
                            || (session.IsUser && (g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(a.LstUser) && lt.Any(y => session.UserId == y)) || a.CreatedBy == session.UserName))
                            || (session.IsBranch && (!string.IsNullOrEmpty(a.LstUser) && lt.Any(k => k == session.UserId) || a.CreatedBy == session.UserName || session.ListUserOfBranch.Count() > 0 && session.ListUserOfBranch.Any(k => k == a.CreatedBy))))
                         select new GridCardJtable
                         {
                             CardID = a.CardID,
                             CardCode = a.CardCode,
                             CardName = a.CardName,
                             ListName = _context.WORKOSLists.FirstOrDefault(y => y.ListCode.Equals(a.ListCode)).ListName ?? "",
                             BoardName = k.BoardName,
                             Deadline = a.Deadline,
                             Currency = _context.CommonSettings.FirstOrDefault(y => y.CodeSet == a.Currency).ValueSet ?? "",
                             Cost = a.Cost,
                             Completed = a.Completed,
                             BeginTime = a.BeginTime,
                             EndTime = a.EndTime,
                             Status = _context.CommonSettings.FirstOrDefault(y => y.CodeSet.Equals(a.Status)).ValueSet,
                             UpdateTime = a.UpdatedTime,
                             CreatedBy = h2.GivenName,
                             CreatedTime = a.CreatedDate.ToString("dd/MM/yyyy"),
                             CreatedDate = a.CreatedDate,
                             UpdatedTimeTxt = a.UpdatedTime.HasValue ? a.UpdatedTime.Value.ToString("dd/MM/yyyy HH:mm:ss") : "",
                             WorkType = !string.IsNullOrEmpty(a.WorkType) ? _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.WorkType).ValueSet : "",
                             Priority = !string.IsNullOrEmpty(a.CardLevel) ? _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.CardLevel).ValueSet : "",
                         }).DistinctBy(x => x.CardCode).OrderByDescending(x => x.UpdateTime.HasValue ? x.UpdateTime.Value : x.CreatedDate).ThenByDescending(x => x.CardID);
            IQueryable<GridCardJtable> data1 = query.AsQueryable<GridCardJtable>();
            return data1;
        }

        [NonAction]
        public IQueryable<GridCardJtable> GetGirdCardOutSupplier(AdvanceSearchObj dataSearch)
        {
            return GetGirdCardOut(dataSearch);
        }
        #endregion

        #region Group User
        [HttpGet]
        public object GetListGroupUserPage(int page, int length, string name)
        {
            var session = HttpContext.GetSessionUser();
            var user = _context.Users.FirstOrDefault(x => x.Active && x.UserName == ESEIM.AppContext.UserName);
            int intBeginFor = (page - 1) * length;
            var count = _context.AdGroupUsers.Where(x => (string.IsNullOrEmpty(name) || x.Title.ToLower().Contains(name.ToLower())) && x.IsEnabled == true && session.IsAllData || session.ListGroupUser.Any(p => p.Equals(x.GroupUserCode))).Count();
            var data = _context.AdGroupUsers.Where(x => (string.IsNullOrEmpty(name) || (x.Title.ToLower().Contains(name.ToLower())))).OrderByDescending(x => x.GroupUserId).Skip(intBeginFor).Take(length).Select(x => new
            {
                Id = x.GroupUserId,
                Code = x.GroupUserCode,
                Name = x.Title,
                CountWork = (from a in _context.CardMappings
                             join b in _context.WORKOSCards.Where(k => k.Status != "TRASH") on a.CardCode equals b.CardCode
                             let lt = b.LstUser.Split(",", StringSplitOptions.None)
                             //where a.TeamCode == x.GroupUserCode && b.IsDeleted == false &&
                             //(session.IsAllData || a.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(b.LstUser) && lt.Any(y => session.UserId == y)) || b.CreatedBy == session.UserName)
                             where a.TeamCode == x.GroupUserCode && b.IsDeleted == false && (session.IsAllData
|| (session.IsUser && (a.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(b.LstUser) && lt.Any(y => session.UserId == y)) || b.CreatedBy == session.UserName))
|| (session.IsBranch && (!string.IsNullOrEmpty(b.LstUser) && lt.Any(k => k == session.UserId) || b.CreatedBy == session.UserName || session.ListUserOfBranch.Count() > 0 && session.ListUserOfBranch.Any(k => k == b.CreatedBy))))
                             select new
                             {
                                 b.CardID,
                                 b.CardCode
                             }).Distinct().Count(),
                CreatedTime = x.CreatedDate,
                IsCheck = false
            });
            return (new
            {
                Tab = "Nhóm",
                Icon = "fa fa-users",
                Total = count,
                ListData = data,
            });
        }

        [HttpPost]
        public JsonResult GetCardWithGroupUser([FromBody]AdvanceSearchObj data)
        {
            if (data.ListObjCode.Any())
            {
                return Json(GetCardDataInGroupUser(data));
            }
            else
            {
                return Json(GetCardDataOutGroupUser(data));
            }
        }

        //[HttpPost]
        //public JsonResult InsertTeam([FromBody]Team data)
        //{
        //    var msg = new JMessage() { Error = true };
        //    try
        //    {
        //        string code = "TEAM_" + (_context.Teams.Count() > 0 ? _context.Teams.Last().Id + 1 : 1);
        //        data.TeamCode = code;

        //        _context.Teams.Add(data);
        //        _context.SaveChanges();

        //        msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["CJ_CURD_TXT_TEAM_CODE"]);//"Thêm nhóm mới thành công!";
        //        msg.Error = false;
        //        return Json(msg);
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Object = ex;
        //        msg.Title = _sharedResources["COM_MSG_ERR"];
        //        //msg.Title = String.Format(_stringLocalize["COM_MSG_ADD_FAILED"), _stringLocalize["CJ_CURD_TXT_TEAM_CODE"));//"Có lỗi xảy ra khi thêm!";
        //        return Json(msg);
        //    }
        //}

        //[HttpPost]
        //public JsonResult EditTeam([FromBody]Team data)
        //{
        //    var msg = new JMessage() { Error = true };
        //    try
        //    {
        //        var currentData = _context.Teams.FirstOrDefault(x => x.TeamCode == data.TeamCode);
        //        currentData.TeamName = data.TeamName;
        //        currentData.Members = data.Members;
        //        currentData.Leader = data.Leader;
        //        _context.SaveChanges();

        //        msg.Error = false;
        //        //msg.Title = String.Format(_stringLocalize["COM_MSG_UPDATE_SUCCESS"), _stringLocalize["CJ_CURD_TXT_TEAM_CODE")); //"Cập nhật thành công";
        //        msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["CJ_CURD_TXT_TEAM_CODE"]);
        //        return Json(msg);
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Object = ex;
        //        msg.Title = _sharedResources["COM_MSG_ERR"];
        //        //msg.Title = String.Format(_stringLocalize["COM_MSG_UPDATE_FAILED"), _stringLocalize["CJ_CURD_TXT_TEAM_CODE"));//"Có lỗi xảy ra!";
        //        return Json(msg);
        //    }
        //}

        [HttpPost]
        public JsonResult GetListGroupUser()
        {
            var data = _context.AdGroupUsers.Where(x => x.IsEnabled == true).Select(x => new
            {
                Code = x.GroupUserCode,
                Name = x.Title,
                Type = 1,
                Group = "Nhóm"
            });
            return Json(data);
        }

        //[HttpPost]
        //public JsonResult GetListTeamsInBoard()
        //{
        //    var query = (from a in _context.Teams
        //                 join b in _context.WORKOSBoards on a.TeamCode equals b.TeamCode
        //                 select a).AsNoTracking().Distinct();
        //    return Json(query);
        //}

        //[HttpPost]
        //public JsonResult DeleteTeam(string TeamCode)
        //{
        //    var msg = new JMessage() { Error = true };
        //    try
        //    {
        //        var data = _context.Teams.FirstOrDefault(x => x.TeamCode.Equals(TeamCode));
        //        //data.Flag = true;

        //        _context.Teams.Remove(data);
        //        _context.SaveChanges();

        //        msg.Error = false;
        //        msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer["CJ_CURD_TXT_TEAM_CODE"]); ;// "Xóa thành công";
        //        return Json(msg);
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Object = ex;
        //        msg.Title = _sharedResources["COM_MSG_ERR"];
        //        //msg.Title = String.Format(_stringLocalize["COM_MSG_DELETE_FAIL"), _stringLocalize["CJ_CURD_TXT_TEAM_CODE"));//"Có lỗi xảy ra!";
        //        return Json(msg);
        //    }
        //}

        [HttpPost]
        public JsonResult GetMemberInGroupUser(string groupUserCode)
        {
            var query = from a in _context.AdUserInGroups
                        join b in _context.Users on a.UserId equals b.Id
                        where a.GroupUserCode == groupUserCode
                        select new
                        {
                            UserId = b.Id,
                            b.GivenName,
                            Type = 1,
                            b.DepartmentId
                        };
            return Json(query);
        }

        //[HttpPost]
        //public JsonResult GetItemTeam(string TeamCode)
        //{
        //    var data = _context.Teams.FirstOrDefault(x => x.TeamCode.Equals(TeamCode));
        //    return Json(data);
        //}

        [NonAction]
        public object GetCardDataInGroupUser(AdvanceSearchObj data)
        {
            var session = HttpContext.GetSessionUser();
            var user = _context.Users.FirstOrDefault(x => x.Active && x.UserName == ESEIM.AppContext.UserName);
            int intBeginFor = (data.Page - 1) * data.Length;
            var fromDate = string.IsNullOrEmpty(data.FromDate) ? (DateTime?)null : DateTime.ParseExact(data.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var toDate = string.IsNullOrEmpty(data.ToDate) ? (DateTime?)null : DateTime.ParseExact(data.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var query = (from a in _context.CardMappings.Where(x => !string.IsNullOrEmpty(x.TeamCode))
                         join b in _context.WORKOSCards on a.CardCode equals b.CardCode
                         let lt = b.LstUser.Split(",", StringSplitOptions.None)
                         join d in _context.Users.Where(x => x.Active) on b.CreatedBy equals d.UserName
                         where data.ListObjCode.Any(x => x.Code == a.TeamCode) &&
                         (fromDate == null || b.BeginTime >= fromDate) &&
                         (toDate == null || (b.EndTime.HasValue ? b.EndTime.Value.Date : DateTime.Now.Date) <= toDate) &&
                         (string.IsNullOrEmpty(data.Status) || (!string.IsNullOrEmpty(b.Status) && b.Status.Equals(data.Status))) &&
                         (string.IsNullOrEmpty(data.CardName) || b.CardName.ToUpper().Contains(data.CardName.ToUpper())) &&
                         (string.IsNullOrEmpty(data.BranchId) || d.BranchId.ToUpper().Equals(data.BranchId.ToUpper())) &&
                         b.IsDeleted == false
                         //(session.IsAllData || a.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(b.LstUser) && lt.Any(y => session.UserId == y)) || b.CreatedBy == session.UserName)
                         && (session.IsAllData
                        || (session.IsUser && (a.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(b.LstUser) && lt.Any(y => session.UserId == y)) || b.CreatedBy == session.UserName))
                        || (session.IsBranch && (!string.IsNullOrEmpty(b.LstUser) && lt.Any(k => k == session.UserId) || b.CreatedBy == session.UserName || session.ListUserOfBranch.Count() > 0 && session.ListUserOfBranch.Any(k => k == b.CreatedBy))))

                         group b by b.ListCode into g
                         select new
                         {
                             ListCode = g.Key,
                             ListCard = g.Select(y => new
                             {
                                 y.CardID,
                                 y.CardCode,
                                 y.CardName,
                                 y.Deadline,
                                 y.Quantitative,
                                 y.Unit,
                                 y.Currency,
                                 y.Status,
                                 BeginTime = y.BeginTime.ToString("dd/MM/yyyy"),
                                 EndTime = y.EndTime.HasValue ? y.EndTime.Value.ToString("dd/MM/yyyy") : "",
                                 y.Cost,
                                 y.Completed,
                                 y.LocationText,
                             }).Distinct()
                         }).AsNoTracking();
            var list = (from a in query
                        join b in _context.WORKOSLists on a.ListCode equals b.ListCode
                        where b.IsDeleted == false
                        select new { a, b });
            var listPaging = list.Skip(intBeginFor).Take(data.Length).Select(x => new
            {
                x.b.ListID,
                x.b.ListCode,
                x.b.ListName,
                x.b.Completed,
                x.b.WeightNum,
                x.b.Status,
                x.b.BeginTime,
                x.b.Deadline,
                x.b.Background,
                x.b.Order,
                ListCard = x.a.ListCard.Select(y => new
                {
                    y.CardID,
                    y.CardCode,
                    y.CardName,
                    y.Deadline,
                    y.Quantitative,
                    y.Unit,
                    y.Currency,
                    CurrencyValue = _context.CommonSettings.FirstOrDefault(z => z.CodeSet == y.Currency).ValueSet ?? "",
                    y.BeginTime,
                    y.EndTime,
                    Status = _context.CommonSettings.FirstOrDefault(z => z.CodeSet == y.Status).ValueSet ?? "",
                    CountCheckListDone = _context.CardItemChecks.Where(z => z.CardCode == y.CardCode && z.Completed == 100 && z.Flag == false).Count(),
                    CountCheckList = _context.CardItemChecks.Where(z => z.CardCode == y.CardCode && z.Flag == false).Count(),
                    y.Cost,
                    y.Completed,
                    y.LocationText,
                })
            });
            return new
            {
                Data = listPaging,
                Total = list.Count(),
            };
        }

        [NonAction]
        public object GetCardDataOutGroupUser(AdvanceSearchObj data)
        {
            var session = HttpContext.GetSessionUser();
            var user = _context.Users.FirstOrDefault(x => x.Active && x.UserName == ESEIM.AppContext.UserName);
            int intBeginFor = (data.Page - 1) * data.Length;
            var fromDate = string.IsNullOrEmpty(data.FromDate) ? (DateTime?)null : DateTime.ParseExact(data.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var toDate = string.IsNullOrEmpty(data.ToDate) ? (DateTime?)null : DateTime.ParseExact(data.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            //danh sách card mới,thẻ mới
            if (fromDate == null && toDate == null && string.IsNullOrEmpty(data.CardName) && string.IsNullOrEmpty(data.Status) && string.IsNullOrEmpty(data.BranchId))
            {
                var query = (from a in _context.WORKOSCards
                             let lt = a.LstUser.Split(",", StringSplitOptions.None)
                             join g in _context.CardMappings on a.CardCode equals g.CardCode into g1
                             from g2 in g1.DefaultIfEmpty()
                             where a.CreatedDate.Date == DateTime.Today && a.IsDeleted == false
                             //(session.IsAllData || g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(a.LstUser) && lt.Any(y => session.UserId == y)) || a.CreatedBy == session.UserName)
                             && (session.IsAllData
                            || (session.IsUser && (g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(a.LstUser) && lt.Any(y => session.UserId == y)) || a.CreatedBy == session.UserName))
                            || (session.IsBranch && (!string.IsNullOrEmpty(a.LstUser) && lt.Any(k => k == session.UserId) || a.CreatedBy == session.UserName || session.ListUserOfBranch.Count() > 0 && session.ListUserOfBranch.Any(k => k == a.CreatedBy))))
                             group a by a.ListCode into g
                             select new
                             {
                                 ListCode = g.Key,
                             }).AsNoTracking();
                var list = (from a in _context.WORKOSLists
                            from b in query
                            where ((a.ListCode == b.ListCode) || (a.CreatedDate.Date == DateTime.Today) && a.IsDeleted == false)
                            select a).Distinct().AsNoTracking();
                var listPaging = list.Skip(intBeginFor).Take(data.Length).Select(x => new
                {
                    x.ListID,
                    x.ListCode,
                    x.ListName,
                    x.Completed,
                    x.WeightNum,
                    x.Status,
                    x.BeginTime,
                    x.Deadline,
                    x.Background,
                    x.Order,
                    ListCard = _context.WORKOSCards.Where(y => y.ListCode == x.ListCode && y.CreatedDate.Date == DateTime.Today && y.IsDeleted == false).Select(y => new
                    {
                        y.CardID,
                        y.CardCode,
                        y.CardName,
                        y.Deadline,
                        y.Quantitative,
                        y.Unit,
                        y.Currency,
                        CurrencyValue = _context.CommonSettings.FirstOrDefault(z => z.CodeSet == y.Currency).ValueSet ?? "",
                        BeginTime = y.BeginTime.ToString("dd/MM/yyyy"),
                        EndTime = y.EndTime.HasValue ? y.EndTime.Value.ToString("dd/MM/yyyy") : "",
                        Status = _context.CommonSettings.FirstOrDefault(z => z.CodeSet == y.Status).ValueSet ?? "",
                        CountCheckListDone = _context.CardItemChecks.Where(z => z.CardCode == y.CardCode && z.Completed == 100 && z.Flag == false).Count(),
                        CountCheckList = _context.CardItemChecks.Where(z => z.CardCode == y.CardCode && z.Flag == false).Count(),
                        y.Cost,
                        y.Completed,
                        y.LocationText,
                    }).Distinct()
                });
                return new
                {
                    Data = listPaging,
                    Total = list.Count(),
                };
            }
            else
            {
                var query = (from a in _context.WORKOSCards
                             join b in _context.Users.Where(x => x.Active) on a.CreatedBy equals b.UserName
                             let lt = a.LstUser.Split(",", StringSplitOptions.None)
                             join g in _context.CardMappings on a.CardCode equals g.CardCode into g1
                             from g2 in g1.DefaultIfEmpty()
                             where (fromDate == null || a.BeginTime >= fromDate) &&
                             (toDate == null || (a.EndTime.HasValue ? a.EndTime.Value.Date : DateTime.Now.Date) <= toDate) &&
                             (string.IsNullOrEmpty(data.Status) || a.Status.Equals(data.Status)) &&
                             (string.IsNullOrEmpty(data.CardName) || a.CardName.ToUpper().Contains(data.CardName.ToUpper())) &&
                             (string.IsNullOrEmpty(data.BranchId) || b.BranchId.ToUpper().Equals(data.BranchId.ToUpper())) &&
                             a.IsDeleted == false &&
                             (session.IsAllData || g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(a.LstUser) && lt.Any(y => session.UserId == y)) || a.CreatedBy == session.UserName)
                             group a by a.ListCode into g
                             select new
                             {
                                 ListCode = g.Key,
                                 ListCard = g.Select(y => new
                                 {
                                     y.CardID,
                                     y.CardCode,
                                     y.CardName,
                                     y.Deadline,
                                     y.Quantitative,
                                     y.Unit,
                                     y.Currency,
                                     y.Status,
                                     BeginTime = y.BeginTime.ToString("dd/MM/yyyy"),
                                     EndTime = y.EndTime.HasValue ? y.EndTime.Value.ToString("dd/MM/yyyy") : "",
                                     y.Cost,
                                     y.Completed,
                                     y.LocationText,
                                 }).Distinct()
                             }).AsNoTracking();
                var list = (from a in query
                            join b in _context.WORKOSLists on a.ListCode equals b.ListCode
                            where b.IsDeleted == false
                            select new { a, b });
                var listPaging = list.Skip(intBeginFor).Take(data.Length).Select(x => new
                {
                    x.b.ListID,
                    x.b.ListCode,
                    x.b.ListName,
                    x.b.Completed,
                    x.b.WeightNum,
                    x.b.Status,
                    x.b.BeginTime,
                    x.b.Deadline,
                    x.b.Background,
                    x.b.Order,
                    ListCard = x.a.ListCard.Select(y => new
                    {
                        y.CardID,
                        y.CardCode,
                        y.CardName,
                        y.Deadline,
                        y.Quantitative,
                        y.Unit,
                        y.Currency,
                        CurrencyValue = _context.CommonSettings.FirstOrDefault(z => z.CodeSet == y.Currency).ValueSet ?? "",
                        y.BeginTime,
                        y.EndTime,
                        Status = _context.CommonSettings.FirstOrDefault(z => z.CodeSet == y.Status).ValueSet ?? "",
                        CountCheckListDone = _context.CardItemChecks.Where(z => z.CardCode == y.CardCode && z.Completed == 100 && z.Flag == false).Count(),
                        CountCheckList = _context.CardItemChecks.Where(z => z.CardCode == y.CardCode && z.Flag == false).Count(),
                        y.Cost,
                        y.Completed,
                        y.LocationText,
                    })
                });
                return new
                {
                    Data = listPaging,
                    Total = list.Count(),
                };
            }
        }


        [NonAction]
        public IQueryable<GridCardJtable> GetGirdCardGroupUser(AdvanceSearchObj dataSearch)
        {
            IQueryable<GridCardJtable> query = null;
            if (dataSearch.ListObjCode.Any())
            {
                query = GetGirdCardInGroupUser(dataSearch);
            }
            else
            {
                query = GetGirdCardOutGroupUser(dataSearch);
            }
            return query;
        }

        [NonAction]
        public IQueryable<GridCardJtable> GetGirdCardInGroupUser(AdvanceSearchObj dataSearch)
        {
            var session = HttpContext.GetSessionUser();
            var user = _context.Users.FirstOrDefault(x => x.Active && x.UserName == ESEIM.AppContext.UserName);
            var fromDate = string.IsNullOrEmpty(dataSearch.FromDate) ? (DateTime?)null : DateTime.ParseExact(dataSearch.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var toDate = string.IsNullOrEmpty(dataSearch.ToDate) ? (DateTime?)null : DateTime.ParseExact(dataSearch.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var query = (from a in _context.WORKOSCards.Where(x => !x.IsDeleted)
                         let lt = a.LstUser.Split(",", StringSplitOptions.None)
                         join c in _context.Users on a.CreatedBy equals c.UserName into c1
                         from c2 in c1.DefaultIfEmpty()
                         join b in _context.CardMappings.Where(x => dataSearch.ListObjCode.Any(y => y.Code == x.TeamCode)) on a.CardCode equals b.CardCode
                         join g in _context.CardMappings on a.CardCode equals g.CardCode into g1
                         from g2 in g1.DefaultIfEmpty()
                         join h in _context.Users.Where(x => x.Active) on a.CreatedBy equals h.UserName into h1
                         from h2 in h1.DefaultIfEmpty()
                         join i in _context.WORKOSLists.Where(x => !x.IsDeleted) on a.ListCode equals i.ListCode
                         join k in _context.WORKOSBoards.Where(x => !x.IsDeleted) on i.BoardCode equals k.BoardCode
                         where (fromDate == null || a.BeginTime >= fromDate) &&
                               (toDate == null || (a.EndTime.HasValue ? a.EndTime.Value.Date : DateTime.Now.Date) <= toDate) &&
                               ((string.IsNullOrEmpty(dataSearch.Status) && a.Status != "TRASH") || a.Status.Equals(dataSearch.Status)) &&
                               (string.IsNullOrEmpty(dataSearch.BranchId) || c2.BranchId.Equals(dataSearch.BranchId)) &&
                               (string.IsNullOrEmpty(dataSearch.CardName) || a.CardName.ToUpper().Contains(dataSearch.CardName.ToUpper()))
                                // && (session.IsAllData || g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(a.LstUser) && lt.Any(y => session.UserId == y)) || a.CreatedBy == session.UserName)
                                && (session.IsAllData
                                || (session.IsUser && (g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(a.LstUser) && lt.Any(y => session.UserId == y)) || a.CreatedBy == session.UserName))
                                || (session.IsBranch && (!string.IsNullOrEmpty(a.LstUser) && lt.Any(k => k == session.UserId) || a.CreatedBy == session.UserName || session.ListUserOfBranch.Count() > 0 && session.ListUserOfBranch.Any(k => k == a.CreatedBy))))
                         select new GridCardJtable
                         {
                             CardID = a.CardID,
                             CardCode = a.CardCode,
                             CardName = a.CardName,
                             ListName = _context.WORKOSLists.FirstOrDefault(y => y.ListCode.Equals(a.ListCode)).ListName ?? "",
                             BoardName = k.BoardName,
                             Deadline = a.Deadline,
                             Currency = _context.CommonSettings.FirstOrDefault(y => y.CodeSet == a.Currency).ValueSet ?? "",
                             Cost = a.Cost,
                             Completed = a.Completed,
                             BeginTime = a.BeginTime,
                             EndTime = a.EndTime,
                             Status = _context.CommonSettings.FirstOrDefault(y => y.CodeSet.Equals(a.Status)).ValueSet,
                             UpdateTime = a.UpdatedTime,
                             CreatedBy = h2.GivenName,
                             CreatedTime = a.CreatedDate.ToString("dd/MM/yyyy"),
                             CreatedDate = a.CreatedDate,
                             UpdatedTimeTxt = a.UpdatedTime.HasValue ? a.UpdatedTime.Value.ToString("dd/MM/yyyy HH:mm:ss") : "",
                             WorkType = !string.IsNullOrEmpty(a.WorkType) ? _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.WorkType).ValueSet : "",
                             Priority = !string.IsNullOrEmpty(a.CardLevel) ? _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.CardLevel).ValueSet : "",
                         }).DistinctBy(x => x.CardCode).OrderByDescending(x => x.UpdateTime.HasValue ? x.UpdateTime.Value : x.CreatedDate).ThenByDescending(x => x.CardID);
            IQueryable<GridCardJtable> data1 = query.AsQueryable<GridCardJtable>();
            return data1;
        }

        [NonAction]
        public IQueryable<GridCardJtable> GetGirdCardOutGroupUser(AdvanceSearchObj dataSearch)
        {
            return GetGirdCardOut(dataSearch);
        }
        #endregion

        #region Board
        [HttpPost]
        public object GetBoardsType()
        {
            var list = _context.CommonSettings.Where(x => x.IsDeleted == false && x.Group == "BOARD_TYPE").Select(x => new { Code = x.CodeSet, Name = x.ValueSet }).AsNoTracking();
            return Json(list);
        }

        [HttpPost]
        public JsonResult GetBoardsWithGroupBy()
        {
            var query = from a in _context.WORKOSBoards
                        where a.IsDeleted == false
                        //group a by a.BoardType into grp
                        group a by new { a.BoardType } into grp
                        orderby grp.Key.BoardType descending
                        select new
                        {
                            BoardType = grp.FirstOrDefault().BoardType,
                            BoardTypeText = _context.CommonSettings.FirstOrDefault(x => x.CodeSet == grp.First().BoardType).ValueSet ?? "",
                            ListBoard = grp.Select(x => new
                            {
                                x.BoardID,
                                x.BoardCode,
                                x.BoardName,
                                x.Completed,
                                x.Cost,
                                x.LocationText,
                                x.LocationGps,
                                x.BoardType,
                                x.Visibility,
                                x.BackgroundColor,
                                x.BackgroundImage,
                                x.Avatar,
                                x.BeginTime,
                                x.Deadline,
                                x.DeadLineView,
                                x.Branch,
                                x.Department,
                                BranchText = _context.AdOrganizations.FirstOrDefault(k => k.IsEnabled && k.OrgAddonCode == x.Branch).OrgName ?? "",
                                DepartmentText = _context.AdDepartments.FirstOrDefault(k => k.IsEnabled && k.DepartmentCode == x.Department).Title ?? ""
                            }).GroupBy(x => new { x.Branch, x.Department })
                        };
            return Json(query);
        }

        [HttpPost]
        public JsonResult GetBoardsWithWorkFlow(string objCode)
        {
            if (string.IsNullOrEmpty(objCode))
            {
                var query = (from a in _context.WORKOSBoards
                             join b in _context.WfObjects on a.BoardCode equals b.WfObjCode
                             where a.IsDeleted == false && b.WfObjType == "BOARD"
                             group a by new { a.BoardType } into grp
                             orderby grp.Key.BoardType descending
                             select new
                             {
                                 BoardType = grp.FirstOrDefault(),
                                 BoardTypeText = _context.CommonSettings.FirstOrDefault(x => x.CodeSet == grp.First().BoardType).ValueSet ?? "",
                                 ListBoard = grp.Select(x => new
                                 {
                                     x.BoardID,
                                     x.BoardCode,
                                     x.BoardName,
                                     x.Completed,
                                     x.Cost,
                                     x.LocationText,
                                     x.LocationGps,
                                     x.BoardType,
                                     x.Visibility,
                                     x.BackgroundColor,
                                     x.BackgroundImage,
                                     x.Avatar,
                                     x.BeginTime,
                                     x.Deadline,
                                     x.DeadLineView,
                                 })
                             });
                return Json(query);
            }
            else
            {
                var query = (from a in _context.WORKOSBoards
                             join b in _context.WfObjects on a.BoardCode equals b.WfObjCode
                             where a.IsDeleted == false && b.WfObjType == "BOARD"
                             group a by new { a.BoardType } into grp
                             orderby grp.Key.BoardType descending
                             select new
                             {
                                 BoardType = grp.FirstOrDefault(),
                                 BoardTypeText = _context.CommonSettings.FirstOrDefault(x => x.CodeSet == grp.First().BoardType).ValueSet ?? "",
                                 ListBoard = grp.Select(x => new
                                 {
                                     x.BoardID,
                                     x.BoardCode,
                                     x.BoardName,
                                     Completed = _cardService.GetCompletedBoard(x.BoardCode, objCode),
                                     x.Cost,
                                     x.LocationText,
                                     x.LocationGps,
                                     x.BoardType,
                                     x.Visibility,
                                     x.BackgroundColor,
                                     x.BackgroundImage,
                                     x.Avatar,
                                     x.BeginTime,
                                     x.Deadline,
                                     x.DeadLineView,
                                 })
                             });
                return Json(query);
            }

        }

        [HttpPost]
        public JsonResult GetListBoard()
        {
            var data = _context.WORKOSBoards.Where(x => x.IsDeleted == false).Select(x => new
            {
                x.BoardID,
                x.BoardCode,
                x.BoardName,
                x.BoardType,
                BoardTypeText = _context.CommonSettings.FirstOrDefault(y => y.CodeSet == x.BoardType).ValueSet ?? "",
                OrderBoardType = (x.BoardType == "BOARD_REPEAT") ? 1 : x.BoardType == "BOARD_PROJECT" ? 2 : 3,
                x.Avatar,
                x.BackgroundColor,
                x.BackgroundImage,
                x.BeginTime,
                x.Completed,
                x.Cost,
                x.Deadline,
                x.LocationGps,
                x.LocationText,
            }).OrderBy(x => x.OrderBoardType).AsNoTracking();
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetBoardDetail(string BoardCode, string objCode)
        {
            var data = _context.WORKOSBoards.FirstOrDefault(x => x.BoardCode.Equals(BoardCode));
            if (data != null && string.IsNullOrEmpty(objCode))
            {
                data.BeginTimeView = data.BeginTime.ToString("dd/MM/yyyy");
                data.DeadLineView = data.Deadline.ToString("dd/MM/yyyy");
                data.TeamName = _context.Teams.FirstOrDefault(x => x.TeamCode == data.TeamCode)?.TeamName;

            }
            else if (data != null && !string.IsNullOrEmpty(objCode))
            {
                data.BeginTimeView = data.BeginTime.ToString("dd/MM/yyyy");
                data.DeadLineView = data.Deadline.ToString("dd/MM/yyyy");
                data.TeamName = _context.Teams.FirstOrDefault(x => x.TeamCode == data.TeamCode)?.TeamName;
                data.Completed = _cardService.GetCompletedBoard(data.BoardCode, objCode);
            }
            return Json(data);
        }

        [HttpPost]
        public JsonResult InsertBoard([FromBody]WORKOSBoard data)
        {
            if (string.IsNullOrEmpty(data.BoardName))
            {
                return Json(new JMessage() { Error = true, Title = String.Format(_stringLocalizer["CJ_CURD_MSG_CONTENT_BLANK"]) });//"Chưa nhập nội dung!"
            }
            var msg = new JMessage() { Error = false };
            try
            {
                data.BoardCode = "BOARD_" + (Guid.NewGuid().ToString());
                if (string.IsNullOrEmpty(data.BackgroundColor) && string.IsNullOrEmpty(data.BackgroundImage))
                {
                    data.BackgroundColor = "#179da7";
                }
                data.BoardType = string.IsNullOrEmpty(data.BoardType) ? "BOARD_OTHER" : data.BoardType;
                data.BeginTime = !string.IsNullOrEmpty(data.BeginTimeView) ? DateTime.ParseExact(data.BeginTimeView, "dd/MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;
                data.Avatar = "/images/logo/trello.png";
                data.Deadline = !string.IsNullOrEmpty(data.DeadLineView) ? DateTime.ParseExact(data.DeadLineView, "dd/MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;
                _context.WORKOSBoards.Add(data);

                //Insert list default

                var workOSList = new WORKOSList
                {
                    ListCode = "LIST_" + Guid.NewGuid().ToString().ToUpper(),
                    BoardCode = data.BoardCode,
                    Status = 1,
                    Order = _context.WORKOSLists.Count() + 1,
                    Background = "background-color: rgb(68, 190, 199);",
                    BeginTime = DateTime.Now,
                    Deadline = data.Deadline,
                    ListName = data.BoardName,
                };
                _context.WORKOSLists.Add(workOSList);
                _context.SaveChanges();
                msg.Object = data.BoardCode;
                msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["CJ_CURD_LBL_BOARD_CODE"]);//"Thêm bảng mới thành công";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                //msg.Title = String.Format(_stringLocalize["COM_MSG_ADD_FAILED"), _stringLocalize["CJ_CURD_LBL_BOARD_CODE"));// "Có lỗi khi thêm bảng mới!";
                msg.Object = ex;
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult CheckExistBoardName([FromBody]WORKOSBoard data)
        {
            bool isExistBoard = false;
            var checkExist = _context.WORKOSBoards.FirstOrDefault(x => x.IsDeleted == false && x.BoardName.ToLower() == data.BoardName.ToLower());
            if (checkExist != null)
            {
                isExistBoard = true;
            }
            return Json(isExistBoard);
        }

        [HttpPost]
        public JsonResult EditBoard([FromBody]WORKOSBoard data)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var editData = _context.WORKOSBoards.FirstOrDefault(x => x.BoardID == data.BoardID);
                editData.BoardName = data.BoardName;
                editData.Visibility = data.Visibility;
                editData.BackgroundColor = data.BackgroundColor;
                editData.BackgroundImage = data.BackgroundImage;
                editData.Avatar = data.Avatar;
                editData.TeamCode = data.TeamCode;
                editData.BoardType = data.BoardType;
                editData.Deadline = !string.IsNullOrEmpty(data.DeadLineView) ? DateTime.ParseExact(data.DeadLineView, "dd/MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;
                editData.Branch = data.Branch;
                editData.Department = data.Department;
                _context.WORKOSBoards.Update(editData);
                _context.SaveChanges();
                msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["CJ_CURD_LBL_BOARD_CODE"]);//"Cập nhật thành công!";
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                //msg.Title = String.Format(_stringLocalize["COM_MSG_UPDATE_FAILED"), _stringLocalize["CJ_CURD_LBL_BOARD_CODE"));// "Có lỗi khi cập nhật bảng!";
                return Json(msg);
            }
        }

        [HttpPost]
        public JsonResult DeleteBoard(int id)
        {
            var msg = new JMessage() { Error = true };
            try
            {
                //deleted board
                var data = _context.WORKOSBoards.FirstOrDefault(x => x.BoardID == id);
                data.IsDeleted = true;
                _context.WORKOSBoards.Update(data);
                //deleted list
                var list = _context.WORKOSLists.Where(x => x.BoardCode == data.BoardCode).ToList();
                list.ForEach(x => x.IsDeleted = true);

                //deleted card
                var card = _context.WORKOSCards.Where(x => list.Any(y => y.ListCode == x.ListCode)).ToList();
                card.ForEach(x => x.IsDeleted = true);

                //delete relative
                var relative = _context.CardMappings.Where(x => x.BoardCode == data.BoardCode).AsNoTracking().ToList();
                _context.CardMappings.RemoveRange(relative);

                _context.SaveChanges();
                msg.Error = false;
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer["CJ_CURD_LBL_BOARD_CODE"]);//"Xóa bảng thành công";
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                //msg.Title = String.Format(_stringLocalize["COM_MSG_DELETE_FAIL"), _stringLocalize["CJ_CURD_LBL_BOARD_CODE"));//"Có lỗi khi xóa bảng!";
                return Json(msg);
            }
        }

        [NonAction]
        public IQueryable<GridCardJtable> GetGirdCardBoard(AdvanceSearchObj dataSearch)
        {
            var session = HttpContext.GetSessionUser();
            var user = _context.Users.FirstOrDefault(x => x.Active && x.UserName == ESEIM.AppContext.UserName);
            var fromDate = string.IsNullOrEmpty(dataSearch.FromDate) ? (DateTime?)null : DateTime.ParseExact(dataSearch.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var toDate = string.IsNullOrEmpty(dataSearch.ToDate) ? (DateTime?)null : DateTime.ParseExact(dataSearch.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            if (!string.IsNullOrEmpty(dataSearch.BoardCode))
            {
                var query = (from a in _context.WORKOSCards.Where(x => !x.IsDeleted)
                             let lt = a.LstUser.Split(",", StringSplitOptions.None)
                             join b in _context.WORKOSLists.Where(x => !x.IsDeleted) on a.ListCode equals b.ListCode
                             join k in _context.WORKOSBoards.Where(x => !x.IsDeleted) on b.BoardCode equals k.BoardCode
                             join c in _context.CardCommentLists on a.CardCode equals c.CardCode into c1
                             from c2 in c1.DefaultIfEmpty()
                             join d in _context.CardItemChecks on a.CardCode equals d.CardCode into d1
                             from d2 in d1.DefaultIfEmpty()
                             join e in _context.JcObjectIdRelatives on a.CardCode equals e.CardCode into e1
                             from e2 in e1.DefaultIfEmpty()
                             join f in _context.Users.Where(x => x.Active) on a.CreatedBy equals f.UserName
                             join g in _context.CardMappings on a.CardCode equals g.CardCode into g1
                             from g2 in g1.DefaultIfEmpty()
                             join h in _context.Users.Where(x => x.Active) on a.CreatedBy equals h.UserName into h1
                             from h2 in h1.DefaultIfEmpty()
                             where !e2.IsDeleted && k.BoardCode.Equals(dataSearch.BoardCode) &&
                             ((string.IsNullOrEmpty(dataSearch.CardName) || a.CardName.ToUpper().Contains(dataSearch.CardName.ToUpper())) ||
                              (string.IsNullOrEmpty(dataSearch.CardName) || a.CardCode.ToLower().Contains(dataSearch.CardName.ToLower())) ||
                             (string.IsNullOrEmpty(dataSearch.CardName) || c2.CmtContent.ToUpper().Contains(dataSearch.CardName.ToUpper())) ||
                             (string.IsNullOrEmpty(dataSearch.CardName) || d2.CheckTitle.ToUpper().Contains(dataSearch.CardName.ToUpper())) ||
                             (string.IsNullOrEmpty(dataSearch.CardName) || a.Description.ToLower().Contains(dataSearch.CardName.ToLower()))) &&
                             ((string.IsNullOrEmpty(dataSearch.Status) && a.Status != "TRASH") || a.Status.Equals(dataSearch.Status)) &&
                             (string.IsNullOrEmpty(dataSearch.Object) || e2.ObjID.Equals(dataSearch.Object)) &&
                             (string.IsNullOrEmpty(dataSearch.BranchId) || f.BranchId.Equals(dataSearch.BranchId)) &&
                             (string.IsNullOrEmpty(dataSearch.ObjType) || e2.ObjTypeCode.Equals(dataSearch.ObjType)) &&
                             (fromDate == null || a.BeginTime.Date >= fromDate) &&
                             (toDate == null || (a.EndTime.HasValue ? a.EndTime.Value.Date : DateTime.Now.Date) <= toDate)
                             && (session.IsAllData
                             || (session.IsUser && (g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(a.LstUser) && lt.Any(y => session.UserId == y)) || a.CreatedBy == session.UserName))
                             || (session.IsBranch && (!string.IsNullOrEmpty(a.LstUser) && lt.Any(k => k == session.UserId) || a.CreatedBy == session.UserName || session.ListUserOfBranch.Count() > 0 && session.ListUserOfBranch.Any(k => k == a.CreatedBy))))
                             select new GridCardJtable
                             {
                                 CardID = a.CardID,
                                 CardCode = a.CardCode,
                                 CardName = a.CardName,
                                 ListName = b.ListName,
                                 BoardName = k.BoardName,
                                 Deadline = a.Deadline,
                                 Currency = _context.CommonSettings.FirstOrDefault(y => y.CodeSet == a.Currency).ValueSet ?? "",
                                 Cost = a.Cost,
                                 Completed = a.Completed,
                                 BeginTime = a.BeginTime,
                                 Status = _context.CommonSettings.FirstOrDefault(y => y.CodeSet.Equals(a.Status)).ValueSet,
                                 EndTime = a.EndTime,
                                 UpdateTime = a.UpdatedTime,
                                 CreatedBy = h2.GivenName,
                                 CreatedTime = a.CreatedDate.ToString("dd/MM/yyyy"),
                                 CreatedDate = a.CreatedDate,
                                 UpdatedTimeTxt = a.UpdatedTime.HasValue ? a.UpdatedTime.Value.ToString("dd/MM/yyyy HH:mm:ss") : "",
                                 WorkType = !string.IsNullOrEmpty(a.WorkType) ? _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.WorkType).ValueSet : "",
                                 Priority = !string.IsNullOrEmpty(a.CardLevel) ? _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.CardLevel).ValueSet : "",
                             }).DistinctBy(x => x.CardCode).OrderByDescending(x => x.UpdateTime.HasValue ? x.UpdateTime.Value : x.CreatedDate).ThenByDescending(x => x.CardID);
                IQueryable<GridCardJtable> data1 = query.AsQueryable<GridCardJtable>();
                return data1;
            }
            else
            {
                if (fromDate == null && toDate == null && string.IsNullOrEmpty(dataSearch.Status) && string.IsNullOrEmpty(dataSearch.CardName)
                    && string.IsNullOrEmpty(dataSearch.BranchId) && string.IsNullOrEmpty(dataSearch.BoardSearch) && string.IsNullOrEmpty(dataSearch.Department)
                    && string.IsNullOrEmpty(dataSearch.Group) && string.IsNullOrEmpty(dataSearch.UserId) && string.IsNullOrEmpty(dataSearch.Project)
                    && string.IsNullOrEmpty(dataSearch.Supplier) && string.IsNullOrEmpty(dataSearch.Customer) && string.IsNullOrEmpty(dataSearch.Contract) && string.IsNullOrEmpty(dataSearch.ListCode))
                {
                    var query = (from a in _context.WORKOSCards.Where(x => !x.IsDeleted)
                                 let lt = a.LstUser.Split(",", StringSplitOptions.None)
                                 join b in _context.CardCommentLists on a.CardCode equals b.CardCode
                                 join g in _context.CardMappings on a.CardCode equals g.CardCode into g1
                                 from g2 in g1.DefaultIfEmpty()
                                 join h in _context.Users.Where(x => x.Active) on a.CreatedBy equals h.UserName into h1
                                 from h2 in h1.DefaultIfEmpty()
                                 join h in _context.WORKOSLists.Where(x => !x.IsDeleted) on a.ListCode equals h.ListCode
                                 join k in _context.WORKOSBoards.Where(x => !x.IsDeleted) on h.BoardCode equals k.BoardCode
                                 where (session.IsAllData
                                    || (session.IsUser && (g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(a.LstUser) && lt.Any(y => session.UserId == y)) || a.CreatedBy == session.UserName))
                                    || (session.IsBranch && (!string.IsNullOrEmpty(a.LstUser) && lt.Any(k => k == session.UserId) || a.CreatedBy == session.UserName || session.ListUserOfBranch.Count() > 0
                                        && session.ListUserOfBranch.Any(k => k == a.CreatedBy))))
                                 select new GridCardJtable
                                 {
                                     CardID = a.CardID,
                                     CardCode = a.CardCode,
                                     CardName = a.CardName,
                                     ListName = _context.WORKOSLists.FirstOrDefault(y => y.ListCode.Equals(a.ListCode)).ListName ?? "",
                                     BoardName = k.BoardName,
                                     Deadline = a.Deadline,
                                     Currency = _context.CommonSettings.FirstOrDefault(y => y.CodeSet == a.Currency).ValueSet ?? "",
                                     Cost = a.Cost,
                                     Completed = a.Completed,
                                     BeginTime = a.BeginTime,
                                     EndTime = a.EndTime,
                                     Status = _context.CommonSettings.FirstOrDefault(y => y.CodeSet.Equals(a.Status)).ValueSet,
                                     UpdateTime = a.UpdatedTime,
                                     CreatedBy = h2.GivenName,
                                     CreatedTime = a.CreatedDate.ToString("dd/MM/yyyy"),
                                     CreatedDate = a.CreatedDate,
                                     UpdatedTimeTxt = a.UpdatedTime.HasValue ? a.UpdatedTime.Value.ToString("dd/MM/yyyy HH:mm:ss") : "",
                                     WorkType = !string.IsNullOrEmpty(a.WorkType) ? _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.WorkType).ValueSet : "",
                                     Priority = !string.IsNullOrEmpty(a.CardLevel) ? _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.CardLevel).ValueSet : "",
                                 }).DistinctBy(x => x.CardCode).OrderByDescending(x => x.UpdateTime.HasValue ? x.UpdateTime.Value : x.CreatedDate).ThenByDescending(x => x.CardID);
                    IQueryable<GridCardJtable> data1 = query.AsQueryable<GridCardJtable>();
                    return data1;
                }
                else
                {
                    var query = (from a in _context.WORKOSCards.Where(x => !x.IsDeleted)
                                 let lt = a.LstUser.Split(",", StringSplitOptions.None)
                                 join b in _context.CardCommentLists on a.CardCode equals b.CardCode into b1
                                 from b2 in b1.DefaultIfEmpty()
                                 join c in _context.CardItemChecks on a.CardCode equals c.CardCode into c1
                                 from c2 in c1.DefaultIfEmpty()
                                 join g in _context.CardMappings on a.CardCode equals g.CardCode into g1
                                 from g2 in g1.DefaultIfEmpty()
                                 join h in _context.Users.Where(x => x.Active) on a.CreatedBy equals h.UserName into h1
                                 from h2 in h1.DefaultIfEmpty()

                                 join k in _context.WORKOSLists.Where(x => !x.IsDeleted) on a.ListCode equals k.ListCode
                                 join h in _context.WORKOSBoards.Where(x => !x.IsDeleted) on k.BoardCode equals h.BoardCode
                                 join m in _context.JcObjectIdRelatives.Where(x => !x.IsDeleted) on a.CardCode equals m.CardCode into m1
                                 from m2 in m1.DefaultIfEmpty()
                                 where (fromDate == null || a.BeginTime >= fromDate) &&
                                       (toDate == null || (a.EndTime.HasValue ? a.EndTime.Value.Date : DateTime.Now.Date) <= toDate) &&
                                       ((string.IsNullOrEmpty(dataSearch.CardName) || a.CardName.ToLower().Contains(dataSearch.CardName.ToLower())) ||
                                       (string.IsNullOrEmpty(dataSearch.CardName) || a.CardCode.ToLower().Contains(dataSearch.CardName.ToLower())) ||
                                       (string.IsNullOrEmpty(dataSearch.CardName) || a.Description.ToLower().Contains(dataSearch.CardName.ToLower())) ||
                                       (string.IsNullOrEmpty(dataSearch.CardName) || c2.CheckTitle.ToLower().Contains(dataSearch.CardName.ToLower())) ||
                                       (string.IsNullOrEmpty(dataSearch.CardName) || b2.CmtContent.ToLower().Contains(dataSearch.CardName.ToLower()))) &&
                                       ((string.IsNullOrEmpty(dataSearch.Status) && a.Status != "TRASH") || a.Status.Equals(dataSearch.Status)) &&
                                       (string.IsNullOrEmpty(dataSearch.BranchId) || h2.BranchId.Equals(dataSearch.BranchId)) &&
                                       (string.IsNullOrEmpty(dataSearch.BoardSearch) || h.BoardCode.Equals(dataSearch.BoardSearch)) &&
                                       (string.IsNullOrEmpty(dataSearch.ListCode) || k.ListCode.Equals(dataSearch.ListCode)) &&
                                       (string.IsNullOrEmpty(dataSearch.Department) || g2.GroupUserCode.Equals(dataSearch.Department)) &&
                                       (string.IsNullOrEmpty(dataSearch.Group) || g2.TeamCode.Equals(dataSearch.Group)) &&
                                       (string.IsNullOrEmpty(dataSearch.Project) || m2.ObjID.Equals(dataSearch.Project)) &&
                                       (string.IsNullOrEmpty(dataSearch.Customer) || m2.ObjID.Equals(dataSearch.Customer)) &&
                                       (string.IsNullOrEmpty(dataSearch.Supplier) || m2.ObjID.Equals(dataSearch.Supplier)) &&
                                       (string.IsNullOrEmpty(dataSearch.Contract) || m2.ObjID.Equals(dataSearch.Contract)) &&
                                       (string.IsNullOrEmpty(dataSearch.UserId) && string.IsNullOrEmpty(dataSearch.UserName) || (!string.IsNullOrEmpty(a.LstUser) && lt.Any(x => x == dataSearch.UserId)) || a.CreatedBy == dataSearch.UserName) &&

                                       (session.IsAllData
                                    || (session.IsUser && (g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(a.LstUser) && lt.Any(y => session.UserId == y)) || a.CreatedBy == session.UserName))
                                    || (session.IsBranch && (!string.IsNullOrEmpty(a.LstUser) && lt.Any(k => k == session.UserId) || a.CreatedBy == session.UserName || session.ListUserOfBranch.Count() > 0
                                        && session.ListUserOfBranch.Any(k => k == a.CreatedBy))))
                                 select new GridCardJtable
                                 {
                                     CardID = a.CardID,
                                     CardCode = a.CardCode,
                                     CardName = a.CardName,
                                     ListName = _context.WORKOSLists.FirstOrDefault(y => y.ListCode.Equals(a.ListCode)).ListName ?? "",
                                     BoardName = h.BoardName,
                                     Deadline = a.Deadline,
                                     Currency = _context.CommonSettings.FirstOrDefault(y => y.CodeSet == a.Currency).ValueSet ?? "",
                                     Cost = a.Cost,
                                     Completed = a.Completed,
                                     BeginTime = a.BeginTime,
                                     EndTime = a.EndTime,
                                     Status = _context.CommonSettings.FirstOrDefault(y => y.CodeSet.Equals(a.Status)).ValueSet,
                                     UpdateTime = a.UpdatedTime,
                                     CreatedBy = h2.GivenName,
                                     CreatedTime = a.CreatedDate.ToString("dd/MM/yyyy"),
                                     CreatedDate = a.CreatedDate,
                                     UpdatedTimeTxt = a.UpdatedTime.HasValue ? a.UpdatedTime.Value.ToString("dd/MM/yyyy HH:mm:ss") : "",
                                     WorkType = !string.IsNullOrEmpty(a.WorkType) ? _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.WorkType).ValueSet : "",
                                     Priority = !string.IsNullOrEmpty(a.CardLevel) ? _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.CardLevel).ValueSet : "",
                                 }).DistinctBy(x => x.CardCode).OrderByDescending(x => x.UpdateTime.HasValue ? x.UpdateTime.Value : x.CreatedDate).ThenByDescending(x => x.CardID);
                    IQueryable<GridCardJtable> data1 = query.AsQueryable<GridCardJtable>();
                    return data1;
                }
            }
        }
        #endregion

        #region List
        [HttpGet]
        public JsonResult GetLists(string BoardCode)
        {
            try
            {
                var data = _context.WORKOSLists.Where(x => x.BoardCode.Equals(BoardCode) && x.IsDeleted == false).OrderBy(x => x.Order);
                return Json(data);
            }
            catch (Exception ex)
            {
                var msg = new JMessage() { Error = true, Title = _sharedResources["COM_MSG_ERR"], Object = ex };//Có lỗi xảy ra!
                return Json(msg);
            }
        }
        [HttpPost]
        public JsonResult InsertList([FromBody]WORKOSList data)
        {
            var msg = new JMessage() { Error = true };
            if (string.IsNullOrEmpty(data.ListName))
            {
                return Json(new JMessage() { Error = true, Title = _stringLocalizer["CJ_CURD_MSG_ADD_CONTENT"] });//"Nhập nội dung"
            }
            if (string.IsNullOrEmpty(data.BoardCode))
            {
                return Json(new JMessage() { Error = true, Title = _stringLocalizer["CJ_MSG_PLS_SELECT_TABLE_WORKING"] });
            }
            try
            {
                var getSumWeightNum = _context.WORKOSLists.Where(x => x.BoardCode == data.BoardCode && x.IsDeleted == false).Sum(x => x.WeightNum);
                if ((getSumWeightNum + data.WeightNum) > 100)
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["CJ_MSG_MAXIMUM_WEIGHT"] + (100 - getSumWeightNum) + " % !";
                }
                else
                {
                    data.ListCode = "LIST_" + Guid.NewGuid().ToString();
                    if (data.Status == null)
                    {
                        data.Status = 1;
                    }
                    data.WeightNum = data.WeightNum;
                    data.ListCode = data.ListCode.ToUpper();
                    data.Order = _context.WORKOSLists.Count() + 1;
                    data.Background = "background-color: rgb(68, 190, 199);";
                    data.BeginTime = DateTime.Now;
                    data.Deadline = _context.WORKOSBoards.FirstOrDefault(x => x.BoardCode == data.BoardCode).Deadline;
                    _context.WORKOSLists.Add(data);
                    _context.SaveChanges();

                    msg.Error = false;
                    msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["CJ_CURD_LBL_LIST_CODE"]);//"Thêm danh sách mới thành công";
                    msg.Object = data;
                }
            }
            catch (Exception ex)
            {
                msg.Object = ex;
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                //msg.Title = String.Format(_stringLocalize["COM_MSG_ADD_FAILED"), _stringLocalize["CJ_CURD_LBL_LIST_CODE"));//"Có lỗi khi thêm danh sách mới!";
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult CheckExistListNameInBoard([FromBody]WORKOSList data)
        {
            bool isExistListName = false;
            var checkExist = _context.WORKOSLists.FirstOrDefault(x => x.IsDeleted == false && x.ListName.ToLower() == data.ListName.ToLower() && x.BoardCode == data.BoardCode.ToLower());
            if (checkExist != null)
            {
                isExistListName = true;
            }
            return Json(isExistListName);
        }
        [HttpPost]
        public JsonResult UpdateListName([FromBody]WORKOSList obj)
        {
            var msg = new JMessage() { Error = true };
            try
            {
                var data = _context.WORKOSLists.FirstOrDefault(x => x.ListID == obj.ListID);
                data.ListName = obj.ListName;
                _context.SaveChanges();

                msg.Error = false;
                msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["CJ_CURD_LBL_LIST_CODE"]);//"Cập nhật thành công";
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                //msg.Title = String.Format(_stringLocalize["COM_MSG_UPDATE_FAILED"), _stringLocalize["CJ_CURD_LBL_LIST_CODE"));//"Có lỗi xảy ra!";
                return Json(msg);
                throw;
            }
        }
        [HttpPost]
        public JsonResult UpdateOrder(string Orther, string Entry)
        {
            var msg = new JMessage() { Error = true };
            List<string> orther = Orther.Split(',').ToList();
            List<string> entry = Entry.Split(',').ToList();
            List<string> a = new List<string>();
            List<string> b = new List<string>();

            for (int i = 0; i < orther.Count; i++)
            {
                if (orther[i] != entry[i])
                {
                    a.Add(orther[i]);
                    b.Add(entry[i]);
                }
            }

            //List<WORKOSList> data = new List<WORKOSList>();
            for (int i = 0; i < a.Count; i++)
            {
                var data = _context.WORKOSLists.FirstOrDefault(x => x.Order == int.Parse(b[i]));
                data.Order = int.Parse(a[i]);
            }

            _context.SaveChanges();

            return Json("");
        }
        [HttpPost]
        public JsonResult SortListByStatus(string BoardCode, int Orther)
        {
            var msg = new JMessage() { Error = true };
            try
            {
                List<WORKOSList> data = new List<WORKOSList>();
                List<int> orther = new List<int>();

                if (Orther == 0)
                {
                    data = _context.WORKOSLists.Where(x => x.BoardCode.Equals(BoardCode)).OrderBy(x => x.Status).ToList();
                }
                else
                {
                    data = _context.WORKOSLists.Where(x => x.BoardCode.Equals(BoardCode)).OrderByDescending(x => x.Status).ToList();
                }

                for (int i = 0; i < data.Count; i++)
                {
                    orther.Add(data[i].Order);
                }
                orther.Sort();
                for (int i = 0; i < data.Count; i++)
                {
                    data[i].Order = orther[i];
                }

                _context.SaveChanges();

                msg.Error = false;
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer["CJ_CURD_LBL_LIST_CODE"]);//"Sắp xếp thành công";
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                //msg.Title = String.Format(_stringLocalize["COM_MSG_DELETE_FAIL"), _stringLocalize["CJ_CURD_LBL_LIST_CODE"));//"Có lỗi xảy ra!";
                return Json(msg);
            }
        }
        [HttpPost]
        public JsonResult ChangeListStatus(int ListID, int Status)
        {
            var msg = new JMessage() { Error = true };
            try
            {
                var data = _context.WORKOSLists.FirstOrDefault(x => x.ListID == ListID);
                data.Status = Status;
                _context.SaveChanges();

                msg.Error = false;
                msg.Title = String.Format(_stringLocalizer["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["CJ_COL_STATUS"]);//"Cập nhật trạng thái thành công";
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                //msg.Title = String.Format(_stringLocalize["COM_MSG_UPDATE_FAILED"), _stringLocalize["CJ_COL_STATUS")); //"Có lỗi xảy ra khi cập nhật trạng thái!";
                return Json(msg);
            }
        }
        [HttpPost]
        public JsonResult ChangeListBackground([FromBody]dynamic obj)
        {
            var msg = new JMessage() { Error = true };
            try
            {
                int id = obj.ListID.Value != null ? Convert.ToInt32(obj.ListID.Value) : 0;
                string backGround = obj.Background.Value;
                var data = _context.WORKOSLists.FirstOrDefault(x => x.ListID == id);
                data.Background = backGround;
                _context.SaveChanges();

                msg.Error = false;
                msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["CJ_CURD_BTN_CHANGE_HEADER_BACKGROUND"]);//"Cập nhật trạng thái thành công";
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                //msg.Title = String.Format(_stringLocalize["COM_MSG_UPDATE_FAILED"), _stringLocalize["CJ_CURD_BTN_CHANGE_HEADER_BACKGROUND")); //"Có lỗi xảy ra khi cập nhật trạng thái!";
                return Json(msg);
            }
        }
        [HttpPost]
        public JsonResult ChangeListWeightNum([FromBody]dynamic obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                int id = obj.ListID.Value != null ? Convert.ToInt32(obj.ListID.Value) : 0;
                decimal weightNum = obj.ListID.Value != null ? Convert.ToDecimal(obj.WeightNum.Value) : 0;
                var data = _context.WORKOSLists.FirstOrDefault(x => x.ListID == id);
                var getSumWeightNum = _context.WORKOSLists.Where(x => x.BoardCode == data.BoardCode && x.ListCode != data.ListCode && x.IsDeleted == false).Sum(x => x.WeightNum);
                if ((getSumWeightNum + weightNum) > 100)
                {
                    msg.Error = true;
                    //msg.Title = "Trọng số tối đa cho phép " + (100 - getSumWeightNum) + "%!";
                    msg.Title = _stringLocalizer["CJ_MSG_MAXIMUM_WEIGHT"] + (100 - getSumWeightNum) + "%!";
                }
                else
                {
                    data.WeightNum = weightNum;
                    msg.Object = _cardService.UpdatePercentParentList(data.ListCode);
                    _context.SaveChanges();
                    //msg.Title = "Cập nhập trọng số thành công!";
                    msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["CJ_MSG_WEIGHT"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                //msg.Title = "Có lỗi xảy ra khi cập nhập trọng số!";
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult ChangeListBeginTime([FromBody]dynamic obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                int id = obj.ListID.Value != null ? Convert.ToInt32(obj.ListID.Value) : 0;
                var beginTime = DateTime.ParseExact(obj.BeginTime.Value, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                var data = _context.WORKOSLists.FirstOrDefault(x => x.ListID == id);
                if (data != null)
                {
                    if (beginTime > data.Deadline)
                    {
                        msg.Error = true;
                        //msg.Title = "Ngày bắt đầu nhỏ hơn ngày kết thúc";
                        msg.Title = _stringLocalizer["CJ_MSG_START_DATE_LESS_EQUAL_END_DATE"];
                    }
                    else
                    {
                        data.BeginTime = beginTime;
                        _context.SaveChanges();
                        //msg.Title = "Cập nhập ngày bắt đầu thành công";
                        msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["CJ_MSG_DATE_START"]);
                    }
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Không tồn tại danh sách!";
                    msg.Title = _stringLocalizer["CJ_MSG_LIST_NOT_EXISTS"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                //msg.Title = "Có lỗi xảy ra khi cập nhập trọng số!";
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult ChangeListDeadLine([FromBody]dynamic obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                int id = obj.ListID.Value != null ? Convert.ToInt32(obj.ListID.Value) : 0;
                var deadLine = DateTime.ParseExact(obj.DeadLine.Value, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                var data = _context.WORKOSLists.FirstOrDefault(x => x.ListID == id);
                if (data != null)
                {
                    data.Deadline = deadLine;
                    _context.SaveChanges();
                    //msg.Title = "Cập nhập ngày hết hạn thành công";
                    msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["CJ_MSG_EXPIRED"]);
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Không tồn tại danh sách!";
                    msg.Title = _stringLocalizer["CJ_MSG_LIST_NOT_EXISTS"];
                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                //msg.Title = "Có lỗi xảy ra khi cập nhập trọng số!";
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        //[HttpPost]
        //public JsonResult ChangeBoard(int ListID, string BoardCode)
        //{
        //    var msg = new JMessage() { Error = true };

        //    try
        //    {
        //        var data = _context.WORKOSLists.FirstOrDefault(x => x.ListID == ListID);
        //        data.BoardCode = BoardCode;
        //        _context.WORKOSLists.Update(data);
        //        _context.SaveChanges();

        //        msg.Title = String.Format(_stringLocalize["CJ_CURD_MSG_CHANGE_BOARD_SUCCESS"));//"Di chuyển danh sách thành công!";
        //        msg.Error = false;
        //        return Json(msg);
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Object = ex;
        //        msg.Title = String.Format(_stringLocalize["CJ_CURD_MSG_CHANGE_BOARD_FAILED"));// "Có lỗi xảy ra khi di chuyển danh sách!";
        //        return Json(msg);
        //    }
        //}
        [HttpPost]
        public JsonResult DeleteList(int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                //deleted List
                var data = _context.WORKOSLists.FirstOrDefault(x => x.ListID == id);
                data.IsDeleted = true;

                //deleted card
                var listCard = _context.WORKOSCards.Where(x => x.ListCode == data.ListCode).ToList();
                listCard.ForEach(x => x.IsDeleted = true);

                //delete relative
                var relative = _context.CardMappings.Where(x => x.ListCode == data.ListCode).AsNoTracking().ToList();
                _context.CardMappings.RemoveRange(relative);

                _cardService.UpdatePercentParentList(data.ListCode);
                _context.SaveChanges();
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer["CJ_CURD_LBL_LIST_CODE"]);//"Xóa danh sách thành công!";
            }
            catch (Exception ex)
            {
                msg.Object = ex;
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                //msg.Title = String.Format(_stringLocalize["COM_MSG_DELETE_FAIL"), _stringLocalize["CJ_CURD_LBL_LIST_CODE"));//"Có lỗi khi xóa danh sách!";
            }
            return Json(msg);
        }

        #endregion

        #region Card
        public class GridCardJtable
        {
            public int CardID { get; set; }
            public string CardCode { get; set; }
            public string CardName { get; set; }
            public string ListName { get; set; }
            public DateTime Deadline { get; set; }
            public string Currency { get; set; }
            public decimal Cost { get; set; }
            public decimal Completed { get; set; }
            public DateTime BeginTime { get; set; }
            public DateTime? EndTime { get; set; }
            public DateTime? UpdateTime { get; set; }
            public string Status { get; set; }
            public string CreatedBy { get; set; }
            public string CreatedTime { get; set; }
            public string UpdatedTimeTxt { get; set; }
            public string Priority { get; set; }
            public string WorkType { get; set; }
            public string BoardName { get; set; }
            public DateTime CreatedDate { get; set; }
        }
        public class DescriptionModel
        {
            public string CardCode { get; set; }
            public string Description { get; set; }
        }
        public class CardRelative
        {
            public string BoardCode { get; set; }
            public string ListCode { get; set; }
            public int TabBoard { get; set; }
            public List<Properties> ListCodeRelative { get; set; }
            public string CardName { get; set; }
        }
        [HttpGet]
        public object GetUnit()
        {
            return _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<CommonEnum>.GetDisplayValue(CommonEnum.Unit)).Select(x => new { Code = x.CodeSet, Value = x.ValueSet });
        }

        [HttpPost]
        public JsonResult GetLevels()
        {
            var data = _context.CommonSettings.Where(x => x.AssetCode.Equals("CARDJOB") && x.Group.Equals("LEVEL") && x.IsDeleted == false)
                        .Select(x => new { Code = x.CodeSet, Value = x.ValueSet }).ToList();
            return Json(data);
        }

        [HttpPost]
        public object GetCurrency()
        {
            return _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<CommonEnum>.GetDisplayValue(CommonEnum.Currency)).OrderBy(x => x.SettingID).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
        }

        [HttpPost]
        public JsonResult GetWorkType()
        {
            var data = _context.CommonSettings.Where(x => x.AssetCode.Equals("CARDJOB") && x.Group.Equals("OBJ_WORKTYPE") && x.IsDeleted == false)
                        .Select(x => new { Code = x.CodeSet, Value = x.ValueSet }).ToList();
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetStatus()
        {
            var data = _context.CommonSettings.Where(x => x.Group == EnumHelper<CardEnum>.GetDisplayValue(CardEnum.Stautus) && x.IsDeleted == false)
                        .Select(x => new { Code = x.CodeSet, Value = x.ValueSet });
            return Json(data);
        }

        [HttpPost]
        public object GetBoardListSugges()
        {
            var maping = _cardService.GetJobCardSuggest(ESEIM.AppContext.UserName);
            if (maping != null)
            {
                return new { BoadCode = maping.BoardCode, ListCode = maping.ListCode };
            }
            else
            {
                return null;
            }
        }

        //[HttpPost]
        //public JsonResult GetCards(string BoardCode)
        //{
        //    var ListCodes = _context.WORKOSLists.Where(x => x.BoardCode.Equals(BoardCode) && x.IsDeleted == false).Select(x => x.ListCode).Distinct();
        //    var data = _context.WORKOSCards.Where(x => ListCodes.Contains(x.ListCode) && x.IsDeleted == false).Select(x => new { x.CardCode, x.CardName, x.ListCode, x.CreatedDate });
        //    return Json(data);
        //}

        [HttpGet]
        public object GetCardActivityByUser(string CardCode)
        {
            var userId = ESEIM.AppContext.UserId;
            var actionView = _context.CardUserActivitys.FirstOrDefault(x => x.UserId == userId && x.CardCode == CardCode && x.Action == EnumHelper<CardAction>.GetDisplayValue(CardAction.Review));
            if (actionView == null)
            {
                var activity = new CardUserActivity
                {
                    UserId = userId,
                    CardCode = CardCode,
                    Action = EnumHelper<CardAction>.GetDisplayValue(CardAction.Review),
                    IsCheck = true,
                    FromDevice = "Mobile",
                    CreatedTime = DateTime.Now
                };
                _context.CardUserActivitys.Add(activity);
                _context.SaveChanges();
            }
            var actionReject = _context.CardUserActivitys.Where(x => x.UserId == userId && x.CardCode == CardCode && x.Action == EnumHelper<CardAction>.GetDisplayValue(CardAction.Reject)).MaxBy(x => x.CreatedTime);
            var actionAcceipt = _context.CardUserActivitys.Where(x => x.UserId == userId && x.CardCode == CardCode && x.Action == EnumHelper<CardAction>.GetDisplayValue(CardAction.Accept)).MaxBy(x => x.CreatedTime);
            return new[]
            {
                new
                {
                    Name= CardAction.Review.DescriptionAttr(),
                    Value= CardAction.Review.GetHashCode(),
                    Date = actionView != null ? actionView.CreatedTime.ToString("dd/MM/yyyy") : DateTime.Now.ToString("dd/MM/yyyy"),
                    Time = actionView != null ? actionView.CreatedTime.ToString("hh:mm:ssy") : DateTime.Now.ToString("hh:mm:ss"),
                    IsCheck = true,
                },
                 new
                {
                    Name= CardAction.Reject.DescriptionAttr(),
                    Value = CardAction.Reject.GetHashCode(),
                    Date = actionReject != null ? actionReject.CreatedTime.ToString("dd/MM/yyyy") : DateTime.Now.ToString("dd/MM/yyyy"),
                    Time = actionReject != null ? actionReject.CreatedTime.ToString("hh:mm:ss") : DateTime.Now.ToString("hh:mm:ss"),
                    IsCheck = actionReject != null ? actionReject.IsCheck : false,
                },
                new
                {
                    Name= actionAcceipt != null? CardAction.Accept.DescriptionAttr() : "Hãy đồng ý!",
                    Value = CardAction.Accept.GetHashCode(),
                    Date = actionAcceipt != null ? actionAcceipt.CreatedTime.ToString("dd/MM/yyyy") : DateTime.Now.ToString("dd/MM/yyyy"),
                    Time = actionAcceipt != null ? actionAcceipt.CreatedTime.ToString("hh:mm:ss") : DateTime.Now.ToString("hh:mm:ss"),
                    IsCheck = actionAcceipt != null ? actionAcceipt.IsCheck : false,
                },
            };
        }

        [HttpGet]
        public JsonResult GetCardDetail(string CardCode)
        {
            var msg = new JMessage { Error = false, Title = "" };
            WORKOSList list = null;
            WORKOSBoard board = null;

            var data = _context.WORKOSCards.FirstOrDefault(x => x.CardCode.Equals(CardCode) && !x.IsDeleted);
            try
            {
                var session = HttpContext.GetSessionUser();
                if (data != null)
                {
                    list = _context.WORKOSLists.FirstOrDefault(x => x.ListCode == data.ListCode && !x.IsDeleted);
                    if (list != null)
                    {
                        board = _context.WORKOSBoards.FirstOrDefault(x => x.BoardCode == (list.BoardCode) && !x.IsDeleted);
                    }
                }
                var checkNotification = _context.CommonSettings.FirstOrDefault(x => x.CodeSet == "NOTIFICATION_CARD" && !x.IsDeleted).ValueSet;
                msg.Object = new
                {
                    CardDetail = data,
                    BoardCompleted = board?.Completed,
                    ListCompleted = list?.Completed,
                    Notification = checkNotification,
                    CurrenUser = ESEIM.AppContext.UserName,
                    Session = session.IsAllData,
                    TimeStart = DateTime.Now,
                    Board = board.BoardCode,
                    List = list.ListCode
                };
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Object = ex.Message;
            }
            return Json(msg);
        }

        [HttpGet]
        public JsonResult GetCardProgress(string CardCode)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.WORKOSCards.FirstOrDefault(x => x.CardCode.Equals(CardCode));
                msg.Object = new
                {
                    data.Progress,
                };
            }
            catch (Exception ex)
            {
                msg.Error = true;
                // msg.Title = "Có lỗi khi lấy dữ liệu!";
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Object = ex.Message;
            }
            return Json(msg);
        }

        //[HttpPost]
        //public JsonResult GetCardTeam(string CardCode)
        //{
        //    var query = from a in _context.CardMappings
        //                join b in _context.Teams on a.TeamCode equals b.TeamCode
        //                where a.CardCode == CardCode && !string.IsNullOrEmpty(a.TeamCode)
        //                select new
        //                {
        //                    a.Id,
        //                    a.Responsibility,
        //                    a.TeamCode,
        //                    b.TeamName,
        //                    b.Members,
        //                    a.CreatedTime
        //                };
        //    return Json(query);
        //}

        [HttpPost]
        public object GetListsAndCard([FromBody]AdvanceSearchObj data)
        {
            var session = HttpContext.GetSessionUser();
            var user = _context.Users.FirstOrDefault(x => x.Active && x.UserName == ESEIM.AppContext.UserName);
            int intBeginFor = (data.Page - 1) * data.Length;
            var fromDate = string.IsNullOrEmpty(data.FromDate) ? (DateTime?)null : DateTime.ParseExact(data.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var toDate = string.IsNullOrEmpty(data.ToDate) ? (DateTime?)null : DateTime.ParseExact(data.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);

            if (!string.IsNullOrEmpty(data.BoardCode))
            {
                var query = (from a in _context.WORKOSLists
                             where a.IsDeleted == false && a.BoardCode == data.BoardCode
                             orderby a.Order
                             select a).AsNoTracking();
                var count = query.Count();
                var list = query.Skip(intBeginFor).Take(data.Length).AsNoTracking().Select(a => new
                {
                    a.ListID,
                    a.ListCode,
                    a.ListName,
                    a.Completed,
                    a.WeightNum,
                    a.Status,
                    a.BeginTime,
                    a.Deadline,
                    a.Background,
                    a.Order,
                    ListCard = (from b in _context.WORKOSCards.Where(x => x.ListCode == a.ListCode && !x.IsDeleted)
                                let lt = b.LstUser.Split(",", StringSplitOptions.None)
                                join g in _context.CardMappings on b.CardCode equals g.CardCode into g1
                                from g2 in g1.DefaultIfEmpty()
                                join c in _context.CardCommentLists on b.CardCode equals c.CardCode into c1
                                from c2 in c1.DefaultIfEmpty()
                                join d in _context.CardItemChecks on b.CardCode equals d.CardCode into d1
                                from d2 in d1.DefaultIfEmpty()
                                join e in _context.JcObjectIdRelatives on b.CardCode equals e.CardCode into e1
                                from e2 in e1.DefaultIfEmpty()
                                join f in _context.Users.Where(x => x.Active) on b.CreatedBy equals f.UserName
                                where (fromDate == null || b.BeginTime.Date >= fromDate) &&
                                (toDate == null || (b.EndTime.HasValue ? b.EndTime.Value.Date : DateTime.Now.Date) <= toDate) &&
                                ((string.IsNullOrEmpty(data.CardName) || b.CardName.ToUpper().Contains(data.CardName.ToUpper())) ||
                                (string.IsNullOrEmpty(data.CardName) || c2.CmtContent.ToUpper().Contains(data.CardName.ToUpper())) ||
                                (string.IsNullOrEmpty(data.CardName) || d2.CheckTitle.ToUpper().Contains(data.CardName.ToUpper())) ||
                                (string.IsNullOrEmpty(data.CardName) || b.Description.ToLower().Contains(data.CardName.ToLower()))) &&
                                ((string.IsNullOrEmpty(data.Status) && b.Status != "TRASH") || b.Status.Equals(data.Status)) &&
                                (string.IsNullOrEmpty(data.Object) || e2.ObjID.Equals(data.Object)) &&
                                (string.IsNullOrEmpty(data.BranchId) || f.BranchId.Equals(data.BranchId))
                                // (session.IsAllData || g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(b.LstUser) && lt.Any(y => session.UserId == y)) || b.CreatedBy == session.UserName)
                                && (session.IsAllData
                                || (session.IsUser && (g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(b.LstUser) && lt.Any(y => session.UserId == y)) || b.CreatedBy == session.UserName))
                                || (session.IsBranch && (!string.IsNullOrEmpty(b.LstUser) && lt.Any(k => k == session.UserId) || b.CreatedBy == session.UserName || session.ListUserOfBranch.Count() > 0 && session.ListUserOfBranch.Any(k => k == b.CreatedBy))))
                                select new
                                {
                                    b.ListCode,
                                    b.CardID,
                                    b.CardCode,
                                    b.CardName,
                                    b.Deadline,
                                    b.Quantitative,
                                    b.Unit,
                                    BeginTime = b.BeginTime.ToString("dd/MM/yyyy"),
                                    EndTime = b.EndTime.HasValue ? b.EndTime.Value.ToString("dd/MM/yyyy") : "",
                                    CurrencyValue = _context.CommonSettings.FirstOrDefault(y => y.CodeSet == b.Currency).ValueSet ?? "",
                                    Status = _context.CommonSettings.FirstOrDefault(y => y.CodeSet.Equals(b.Status)).ValueSet,
                                    CountCheckListDone = _context.CardItemChecks.Where(x => x.Flag == false && x.Completed == 100 && x.CardCode == b.CardCode).AsNoTracking().Count(),
                                    CountCheckList = _context.CardItemChecks.Where(x => x.Flag == false && x.CardCode == b.CardCode).AsNoTracking().Count(),
                                    //b.Cost,
                                    b.Completed,
                                    b.LocationText,
                                    b.CreatedDate
                                }).OrderByDescending(x => x.CreatedDate).DistinctBy(x => x.CardCode)
                });
                return new
                {
                    Data = list,
                    Total = count
                };
            }
            else
            {
                if (fromDate == null && toDate == null && string.IsNullOrEmpty(data.CardName) && string.IsNullOrEmpty(data.Status) && string.IsNullOrEmpty(data.BranchId)
                    && string.IsNullOrEmpty(data.BoardSearch) && string.IsNullOrEmpty(data.Department) && string.IsNullOrEmpty(data.Group))
                {
                    var query = (from a in _context.WORKOSCards
                                 let lt = a.LstUser.Split(",", StringSplitOptions.None)
                                 join g in _context.CardMappings on a.CardCode equals g.CardCode into g1
                                 from g2 in g1.DefaultIfEmpty()
                                 join c in _context.CardCommentLists on a.CardCode equals c.CardCode
                                 where a.IsDeleted == false
                                 && (session.IsAllData
                                || (session.IsUser && (g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(a.LstUser) && lt.Any(y => session.UserId == y)) || a.CreatedBy == session.UserName))
                                || (session.IsBranch && (!string.IsNullOrEmpty(a.LstUser) && lt.Any(k => k == session.UserId) || a.CreatedBy == session.UserName || session.ListUserOfBranch.Count() > 0 && session.ListUserOfBranch.Any(k => k == a.CreatedBy))))
                                 group a by a.ListCode into g
                                 select new
                                 {
                                     ListCode = g.Key,
                                     ListCard = g.Select(y => new
                                     {
                                         y.CardID,
                                         y.CardCode,
                                         y.CardName,
                                         y.Deadline,
                                         y.Quantitative,
                                         y.Unit,
                                         y.Currency,
                                         CurrencyValue = "",
                                         y.BeginTime,
                                         y.EndTime,
                                         Status = y.Status,
                                         CountCheckListDone = "",
                                         CountCheckList = "",
                                         y.Cost,
                                         y.Completed,
                                         y.LocationText,
                                     }).Distinct()
                                 }).AsNoTracking();
                    var listPaging = from a in query.Skip(intBeginFor).Take(data.Length)
                                     join b in _context.WORKOSLists on a.ListCode equals b.ListCode
                                     select new
                                     {
                                         b.ListCode,
                                         b.ListID,
                                         b.ListName,
                                         b.Completed,
                                         b.WeightNum,
                                         b.Status,
                                         b.BeginTime,
                                         b.Deadline,
                                         b.Background,
                                         b.Order,
                                         ListCard = a.ListCard.Select(y => new
                                         {
                                             y.CardID,
                                             y.CardCode,
                                             y.CardName,
                                             y.Deadline,
                                             y.Quantitative,
                                             y.Unit,
                                             y.Currency,
                                             CurrencyValue = _context.CommonSettings.FirstOrDefault(z => z.CodeSet == y.Currency).ValueSet ?? "",
                                             BeginTime = y.BeginTime.ToString("dd/MM/yyyy"),
                                             EndTime = y.EndTime.HasValue ? y.EndTime.Value.ToString("dd/MM/yyyy") : "",
                                             Status = _context.CommonSettings.FirstOrDefault(z => z.CodeSet == y.Status).ValueSet ?? "",
                                             CountCheckListDone = _context.CardItemChecks.Where(z => z.CardCode == y.CardCode && z.Completed == 100 && z.Flag == false).Count(),
                                             CountCheckList = _context.CardItemChecks.Where(z => z.CardCode == y.CardCode && z.Flag == false).Count(),
                                             y.Cost,
                                             y.Completed,
                                             y.LocationText,
                                         })
                                     };
                    return new
                    {
                        Data = listPaging,
                        Total = query.Count(),
                    };
                }
                else
                {
                    var query = (from a in _context.WORKOSCards
                                 let lt = a.LstUser.Split(",", StringSplitOptions.None)
                                 join g in _context.CardMappings on a.CardCode equals g.CardCode into g1
                                 from g2 in g1.DefaultIfEmpty()
                                 join b in _context.Users.Where(x => x.Active) on a.CreatedBy equals b.UserName
                                 join c in _context.WORKOSLists.Where(x => !x.IsDeleted) on a.ListCode equals c.ListCode
                                 join d in _context.WORKOSBoards.Where(x => !x.IsDeleted) on c.BoardCode equals d.BoardCode

                                 where (fromDate == null || a.BeginTime >= fromDate) &&
                                 (toDate == null || (a.EndTime.HasValue ? a.EndTime.Value.Date : DateTime.Now.Date) <= toDate) &&
                                 (string.IsNullOrEmpty(data.CardName) || a.CardName.ToUpper().Contains(data.CardName.ToUpper())) &&
                                 (string.IsNullOrEmpty(data.Status) || a.Status.Equals(data.Status)) &&
                                 (string.IsNullOrEmpty(data.BranchId) || b.BranchId.Equals(data.BranchId)) &&
                                 (string.IsNullOrEmpty(data.BoardSearch) || d.BoardCode.Equals(data.BoardSearch)) &&
                                 (string.IsNullOrEmpty(data.Department) || g2.GroupUserCode.Equals(data.Department)) &&
                                 (string.IsNullOrEmpty(data.Group) || g2.TeamCode.Equals(data.Group)) &&
                                 (string.IsNullOrEmpty(data.UserId) || g2.TeamCode.Equals(data.Group)) &&
                                 a.IsDeleted == false
                                 && (session.IsAllData
                                || (session.IsUser && (g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(a.LstUser) && lt.Any(y => session.UserId == y)) || a.CreatedBy == session.UserName))
                                || (session.IsBranch && (!string.IsNullOrEmpty(a.LstUser) && lt.Any(k => k == session.UserId) || a.CreatedBy == session.UserName || session.ListUserOfBranch.Count() > 0 && session.ListUserOfBranch.Any(k => k == a.CreatedBy))))
                                 group a by a.ListCode into g
                                 select new
                                 {
                                     ListCode = g.Key,
                                     ListCard = g.Select(y => new
                                     {
                                         y.CardID,
                                         y.CardCode,
                                         y.CardName,
                                         y.Deadline,
                                         y.Quantitative,
                                         y.Unit,
                                         y.Currency,
                                         y.Status,
                                         BeginTime = y.BeginTime.ToString("dd/MM/yyyy"),
                                         EndTime = y.EndTime.HasValue ? y.EndTime.Value.ToString("dd/MM/yyyy") : "",
                                         y.Cost,
                                         y.Completed,
                                         y.LocationText,
                                     }).Distinct()
                                 }).AsNoTracking();
                    var list = (from a in query
                                join b in _context.WORKOSLists on a.ListCode equals b.ListCode
                                where b.IsDeleted == false
                                select new { a, b });
                    var listPaging = list.Skip(intBeginFor).Take(data.Length).Select(x => new
                    {
                        x.b.ListID,
                        x.b.ListCode,
                        x.b.ListName,
                        x.b.Completed,
                        x.b.WeightNum,
                        x.b.Status,
                        x.b.BeginTime,
                        x.b.Deadline,
                        x.b.Background,
                        x.b.Order,
                        ListCard = x.a.ListCard.Select(y => new
                        {
                            y.CardID,
                            y.CardCode,
                            y.CardName,
                            y.Deadline,
                            y.Quantitative,
                            y.Unit,
                            y.Currency,
                            CurrencyValue = _context.CommonSettings.FirstOrDefault(z => z.CodeSet == y.Currency).ValueSet ?? "",
                            y.BeginTime,
                            y.EndTime,
                            Status = _context.CommonSettings.FirstOrDefault(z => z.CodeSet == y.Status).ValueSet ?? "",
                            CountCheckListDone = _context.CardItemChecks.Where(z => z.CardCode == y.CardCode && z.Completed == 100 && z.Flag == false).Count(),
                            CountCheckList = _context.CardItemChecks.Where(z => z.CardCode == y.CardCode && z.Flag == false).Count(),
                            y.Cost,
                            y.Completed,
                            y.LocationText,
                        })
                    });
                    return new
                    {
                        Data = listPaging,
                        Total = list.Count(),
                    };
                }
            }
        }

        [HttpPost]
        public JsonResult GetGridCard([FromBody]AdvanceSearchObj jtablePara)
        {
            //TabBoard = 1(Bảng)                  //TabBoard = 5(Dự án)
            //TabBoard = 2(Phòng ban)             //TabBoard = 6(Khách hàng)
            //TabBoard = 3(Nhân viên)             //TabBoard = 7(Hợp đồng)
            //TabBoard = 4(Nhóm)                  //TabBoard = 8(Nhà cung cấp)
            int intBegin = (jtablePara.CurrentPage - 1) * jtablePara.Length;
            IQueryable<GridCardJtable> queryTab = null;
            if (jtablePara.TabBoard == 1)
            {
                queryTab = GetGirdCardBoard(jtablePara);
            }
            else if (jtablePara.TabBoard == 2)
            {
                queryTab = GetGirdCardDepartment(jtablePara);
            }
            else if (jtablePara.TabBoard == 3)
            {
                queryTab = GetGirdCardUser(jtablePara);
            }
            else if (jtablePara.TabBoard == 4)
            {
                queryTab = GetGirdCardGroupUser(jtablePara);
            }
            else if (jtablePara.TabBoard == 5)
            {
                queryTab = GetGirdCardProject(jtablePara);
            }
            else if (jtablePara.TabBoard == 6)
            {
                queryTab = GetGirdCardCustomer(jtablePara);
            }
            else if (jtablePara.TabBoard == 7)
            {
                queryTab = GetGirdCardContract(jtablePara);
            }
            else if (jtablePara.TabBoard == 8)
            {
                queryTab = GetGirdCardSupplier(jtablePara);
            }
            int count = queryTab.Count();
            var data = queryTab.Skip(intBegin).Take(jtablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(
                                data,
                                jtablePara.Draw,
                                count,
                                "CardID", "CardCode", "CardName", "ListName", "Deadline", "Status",
                                "Completed", "BeginTime", "EndTime", "Cost", "Currency", "CreatedBy", "CreatedTime",
                                "Priority", "WorkType", "UpdatedTimeTxt", "UpdateTime", "BoardName"
                                );
            return Json(jdata);
        }

        [NonAction]
        public IQueryable<GridCardJtable> GetGirdCardOut(AdvanceSearchObj dataSearch)
        {
            var fromDate = string.IsNullOrEmpty(dataSearch.FromDate) ? (DateTime?)null : DateTime.ParseExact(dataSearch.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var toDate = string.IsNullOrEmpty(dataSearch.ToDate) ? (DateTime?)null : DateTime.ParseExact(dataSearch.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var session = HttpContext.GetSessionUser();
            var user = _context.Users.FirstOrDefault(x => x.Active && x.UserName == ESEIM.AppContext.UserName);
            if (fromDate == null && toDate == null && string.IsNullOrEmpty(dataSearch.Status) && string.IsNullOrEmpty(dataSearch.CardName) && string.IsNullOrEmpty(dataSearch.BranchId))
            {
                var query = (from a in _context.WORKOSCards.Where(x => !x.IsDeleted)
                             let lt = a.LstUser.Split(",", StringSplitOptions.None)
                             join b in _context.CardCommentLists on a.CardCode equals b.CardCode
                             join g in _context.CardMappings on a.CardCode equals g.CardCode into g1
                             from g2 in g1.DefaultIfEmpty()
                             join h in _context.Users.Where(x => x.Active) on a.CreatedBy equals h.UserName into h1
                             from h2 in h1.DefaultIfEmpty()
                             join i in _context.WORKOSLists.Where(x => !x.IsDeleted) on a.ListCode equals i.ListCode
                             join k in _context.WORKOSBoards.Where(x => !x.IsDeleted) on i.BoardCode equals k.BoardCode
                             where (session.IsAllData
                                || (session.IsUser && (g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(a.LstUser) && lt.Any(y => session.UserId == y)) || a.CreatedBy == session.UserName))
                                || (session.IsBranch && (!string.IsNullOrEmpty(a.LstUser) && lt.Any(k => k == session.UserId) || a.CreatedBy == session.UserName || session.ListUserOfBranch.Count() > 0
                                    && session.ListUserOfBranch.Any(k => k == a.CreatedBy))))
                             select new GridCardJtable
                             {
                                 CardID = a.CardID,
                                 CardCode = a.CardCode,
                                 CardName = a.CardName,
                                 ListName = _context.WORKOSLists.FirstOrDefault(y => y.ListCode.Equals(a.ListCode)).ListName ?? "",
                                 BoardName = k.BoardName,
                                 Deadline = a.Deadline,
                                 Currency = _context.CommonSettings.FirstOrDefault(y => y.CodeSet == a.Currency).ValueSet ?? "",
                                 Cost = a.Cost,
                                 Completed = a.Completed,
                                 BeginTime = a.BeginTime,
                                 EndTime = a.EndTime,
                                 Status = _context.CommonSettings.FirstOrDefault(y => y.CodeSet.Equals(a.Status)).ValueSet,
                                 UpdateTime = a.UpdatedTime,
                                 CreatedBy = h2.GivenName,
                                 CreatedTime = a.CreatedDate.ToString("dd/MM/yyyy"),
                                 CreatedDate = a.CreatedDate,
                                 UpdatedTimeTxt = a.UpdatedTime.HasValue ? a.UpdatedTime.Value.ToString("dd/MM/yyyy HH:mm:ss") : "",
                                 WorkType = !string.IsNullOrEmpty(a.WorkType) ? _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.WorkType).ValueSet : "",
                                 Priority = !string.IsNullOrEmpty(a.CardLevel) ? _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.CardLevel).ValueSet : "",
                             }).DistinctBy(x => x.CardCode).OrderByDescending(x => x.UpdateTime.HasValue ? x.UpdateTime.Value : x.CreatedDate).ThenByDescending(x => x.CardID);
                IQueryable<GridCardJtable> data1 = query.AsQueryable<GridCardJtable>();
                return data1;
            }
            else
            {
                var query = (from a in _context.WORKOSCards.Where(x => !x.IsDeleted)
                             let lt = a.LstUser.Split(",", StringSplitOptions.None)
                             join b in _context.CardCommentLists on a.CardCode equals b.CardCode into b1
                             from b2 in b1.DefaultIfEmpty()
                             join c in _context.CardItemChecks on a.CardCode equals c.CardCode into c1
                             from c2 in c1.DefaultIfEmpty()
                             join g in _context.CardMappings on a.CardCode equals g.CardCode into g1
                             from g2 in g1.DefaultIfEmpty()
                             join h in _context.Users.Where(x => x.Active) on a.CreatedBy equals h.UserName into h1
                             from h2 in h1.DefaultIfEmpty()
                             join i in _context.WORKOSLists.Where(x => !x.IsDeleted) on a.ListCode equals i.ListCode
                             join k in _context.WORKOSBoards.Where(x => !x.IsDeleted) on i.BoardCode equals k.BoardCode
                             where (fromDate == null || a.BeginTime >= fromDate) &&
                                   (toDate == null || (a.EndTime.HasValue ? a.EndTime.Value.Date : DateTime.Now.Date) <= toDate) &&
                                   ((string.IsNullOrEmpty(dataSearch.CardName) || a.CardName.ToLower().Contains(dataSearch.CardName.ToLower())) ||
                                   (string.IsNullOrEmpty(dataSearch.CardName) || a.CardCode.ToLower().Contains(dataSearch.CardName.ToLower())) ||
                                   (string.IsNullOrEmpty(dataSearch.CardName) || a.Description.ToLower().Contains(dataSearch.CardName.ToLower())) ||
                                   (string.IsNullOrEmpty(dataSearch.CardName) || c2.CheckTitle.ToLower().Contains(dataSearch.CardName.ToLower())) ||
                                   (string.IsNullOrEmpty(dataSearch.CardName) || b2.CmtContent.ToLower().Contains(dataSearch.CardName.ToLower()))) &&
                                   ((string.IsNullOrEmpty(dataSearch.Status) && a.Status != "TRASH") || a.Status.Equals(dataSearch.Status)) &&
                                   (string.IsNullOrEmpty(dataSearch.BranchId) || h2.BranchId.Equals(dataSearch.BranchId)) &&
                                   //(session.IsAllData || g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(a.LstUser) && lt.Any(y => session.UserId == y)) || a.CreatedBy == session.UserName)
                                   (session.IsAllData
                                || (session.IsUser && (g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(a.LstUser) && lt.Any(y => session.UserId == y)) || a.CreatedBy == session.UserName))
                                || (session.IsBranch && (!string.IsNullOrEmpty(a.LstUser) && lt.Any(k => k == session.UserId) || a.CreatedBy == session.UserName || session.ListUserOfBranch.Count() > 0
                                    && session.ListUserOfBranch.Any(k => k == a.CreatedBy))))
                             select new GridCardJtable
                             {
                                 CardID = a.CardID,
                                 CardCode = a.CardCode,
                                 CardName = a.CardName,
                                 ListName = _context.WORKOSLists.FirstOrDefault(y => y.ListCode.Equals(a.ListCode)).ListName ?? "",
                                 BoardName = k.BoardName,
                                 Deadline = a.Deadline,
                                 Currency = _context.CommonSettings.FirstOrDefault(y => y.CodeSet == a.Currency).ValueSet ?? "",
                                 Cost = a.Cost,
                                 Completed = a.Completed,
                                 BeginTime = a.BeginTime,
                                 EndTime = a.EndTime,
                                 Status = _context.CommonSettings.FirstOrDefault(y => y.CodeSet.Equals(a.Status)).ValueSet,
                                 UpdateTime = a.UpdatedTime,
                                 CreatedBy = h2.GivenName,
                                 CreatedTime = a.CreatedDate.ToString("dd/MM/yyyy"),
                                 CreatedDate = a.CreatedDate,
                                 UpdatedTimeTxt = a.UpdatedTime.HasValue ? a.UpdatedTime.Value.ToString("dd/MM/yyyy HH:mm:ss") : "",
                                 WorkType = !string.IsNullOrEmpty(a.WorkType) ? _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.WorkType).ValueSet : "",
                                 Priority = !string.IsNullOrEmpty(a.CardLevel) ? _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.CardLevel).ValueSet : "",
                             }).DistinctBy(x => x.CardCode).OrderByDescending(x => x.UpdateTime.HasValue ? x.UpdateTime.Value : x.CreatedDate).ThenByDescending(x => x.CardID);
                IQueryable<GridCardJtable> data1 = query.AsQueryable<GridCardJtable>();
                return data1;
            }
        }

        [HttpPost]
        public JsonResult InsertCard([FromBody]CardRelative data)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            IQueryable<CardMemberCustom> lstUser = null;
            try
            {
                if (string.IsNullOrEmpty(data.CardName))
                {
                    return Json(new JMessage() { Error = true, Title = String.Format(_stringLocalizer["CJ_CURD_MSG_ADD_CONTENT"]) });
                }
                if (string.IsNullOrEmpty(data.ListCode))
                {
                    return Json(new JMessage() { Error = true, Title = "Vui lòng chọn danh sách" });//"Nhập nội dung"
                }
                var list = _context.WORKOSLists.FirstOrDefault(x => x.ListCode == data.ListCode && x.IsDeleted == false);
                var board = _context.WORKOSBoards.FirstOrDefault(x => x.BoardCode == list.BoardCode && x.IsDeleted == false);
                var card = new WORKOSCard
                {
                    CardName = data.CardName,
                    CardCode = "" + (_context.WORKOSCards.Count() > 0 ? _context.WORKOSCards.Max(x => x.CardID) + 1 : 1),
                    ListCode = data.ListCode,
                    CreatedBy = ESEIM.AppContext.UserName,
                    CreatedDate = DateTime.Now,
                    Currency = "VND",
                    Status = "CREATED",
                    BeginTime = DateTime.Now,
                    EndTime = DateTime.Now > list.Deadline ? DateTime.Now : list.Deadline,
                    Deadline = DateTime.Now > list.Deadline ? DateTime.Now : list.Deadline,
                };
                //comment
                var comment = new CardCommentList()
                {
                    CardCode = card.CardCode,
                    CmtId = "Comment" + Guid.NewGuid().ToString(),
                    CmtContent = "Đã tạo công việc",
                    MemberId = ESEIM.AppContext.UserName,
                    CreatedTime = DateTime.Now
                };
                _context.CardCommentLists.Add(comment);

                var addLeader = new CardMapping
                {
                    BoardCode = board.BoardCode,
                    ListCode = list.ListCode,
                    CardCode = card.CardCode,
                    UserId = ESEIM.AppContext.UserId,
                    CreatedBy = ESEIM.AppContext.UserName,
                    CreatedTime = DateTime.Now,
                    Responsibility = "ROLE_LEADER"
                };
                _context.CardMappings.Add(addLeader);

                //Add department of member create card
                var user = _context.Users.FirstOrDefault(x => x.UserName == ESEIM.AppContext.UserName && x.Active);
                var cardMapping = new CardMapping
                {
                    BoardCode = board.BoardCode,
                    ListCode = list.ListCode,
                    CardCode = card.CardCode,
                    GroupUserCode = user.DepartmentId,
                    CreatedBy = ESEIM.AppContext.UserName,
                    CreatedTime = DateTime.Now,
                    Responsibility = "ROLE_MAIN"
                };
                _context.CardMappings.Add(cardMapping);

                msg.Object = card;
                //relative (Board)

                //TabBoard = 1(Bảng)                  //TabBoard = 5(Dự án)
                //TabBoard = 2(Phòng ban)             //TabBoard = 6(Khách hàng)
                //TabBoard = 3(Nhân viên)             //TabBoard = 7(Hợp đồng)
                //TabBoard = 4(Nhóm)                  //TabBoard = 8(Nhà cung cấp)
                //TabBoard = 11(Hợp đồng mua)         //TabBoard = 9(Yêu cầu hỏi giá)
                //TabBoard = 10(Yêu cầu đặt hàng)

                if (data.ListCodeRelative.Any())
                {
                    foreach (var item in data.ListCodeRelative)
                    {
                        var maping = new CardMapping
                        {
                            CardCode = card.CardCode,
                            BoardCode = list.BoardCode,
                            ListCode = card.ListCode,
                            ProjectCode = data.TabBoard == 5 ? item.Code : null,
                            ContractCode = data.TabBoard == 7 ? item.Code : null,
                            CustomerCode = data.TabBoard == 6 ? item.Code : null,
                            SupplierCode = data.TabBoard == 8 ? item.Code : null,
                            Relative = _context.CommonSettings.FirstOrDefault(x => x.Group == EnumHelper<CardEnum>.GetDisplayValue(CardEnum.ObjRelative))?.CodeSet,
                            TeamCode = data.TabBoard == 4 ? item.Code : null,
                            GroupUserCode = data.TabBoard == 2 ? item.Code : null,
                            UserId = data.TabBoard == 3 ? item.Code : null,
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now,
                        };
                        _context.CardMappings.Add(maping);
                    }
                    if (data.TabBoard == 2)
                    {
                        //get all member in groupuser
                        var listUserInDepartment = GetMemberInDepartment(data.ListCodeRelative.Select(x => x.Code));
                        lstUser = listUserInDepartment;
                    }
                    else if (data.TabBoard == 4)
                    {
                        //get all member in team
                        var listUserInTeam = from a in _context.Teams.Where(x => data.ListCodeRelative.Any(y => x.TeamCode == y.Code))
                                             select new
                                             {
                                                 a.Members,
                                             };
                        foreach (var team in listUserInTeam)
                        {
                            var listUser = team.Members.Split(",").Select(x => new CardMemberCustom
                            {
                                UserId = x
                            });
                            lstUser = lstUser != null && lstUser.Any() ? lstUser.Concat(listUser) : listUser.AsQueryable();
                        }
                    }
                    else if (data.TabBoard == 3)
                    {
                        var listUser = data.ListCodeRelative.Select(x => new CardMemberCustom
                        {
                            UserId = x.Code
                        });
                        lstUser = listUser.AsQueryable();
                    }
                    else if (data.TabBoard == 5)
                    {
                        var JcObject = new JcObjectIdRelative
                        {
                            Weight = 0,
                            CardCode = card.CardCode,
                            ObjTypeCode = "PROJECT",
                            ObjID = data.ListCodeRelative[0].Code,
                            Relative = "MAIN",
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now,
                        };
                        _context.JcObjectIdRelatives.Add(JcObject);
                    }
                    else if (data.TabBoard == 7)
                    {
                        var JcObject = new JcObjectIdRelative
                        {
                            Weight = 0,
                            CardCode = card.CardCode,
                            ObjTypeCode = "CONTRACT",
                            ObjID = data.ListCodeRelative[0].Code,
                            Relative = "MAIN",
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now,
                        };
                        _context.JcObjectIdRelatives.Add(JcObject);
                    }
                    else if (data.TabBoard == 11)
                    {
                        var JcObject = new JcObjectIdRelative
                        {
                            Weight = 0,
                            CardCode = card.CardCode,
                            ObjTypeCode = "CONTRACT_PO",
                            ObjID = data.ListCodeRelative[0].Code,
                            Relative = "MAIN",
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now,
                        };
                        _context.JcObjectIdRelatives.Add(JcObject);
                    }
                    else if (data.TabBoard == 9)
                    {
                        var JcObject = new JcObjectIdRelative
                        {
                            Weight = 0,
                            CardCode = card.CardCode,
                            ObjTypeCode = "REQUEST_PRICE",
                            ObjID = data.ListCodeRelative[0].Code,
                            Relative = "MAIN",
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now,
                        };
                        _context.JcObjectIdRelatives.Add(JcObject);
                    }
                    else if (data.TabBoard == 10)
                    {
                        var JcObject = new JcObjectIdRelative
                        {
                            Weight = 0,
                            CardCode = card.CardCode,
                            ObjTypeCode = "REQUEST_PRODUCT",
                            ObjID = data.ListCodeRelative[0].Code,
                            Relative = "MAIN",
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now,
                        };
                        _context.JcObjectIdRelatives.Add(JcObject);
                    }
                    else if (data.TabBoard == 8)
                    {
                        var JcObject = new JcObjectIdRelative
                        {
                            Weight = 0,
                            CardCode = card.CardCode,
                            ObjTypeCode = "SUPPLIER",
                            ObjID = data.ListCodeRelative[0].Code,
                            Relative = "MAIN",
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now,
                        };
                        _context.JcObjectIdRelatives.Add(JcObject);
                    }
                    else if (data.TabBoard == 6)
                    {
                        var JcObject = new JcObjectIdRelative
                        {
                            Weight = 0,
                            CardCode = card.CardCode,
                            ObjTypeCode = "CUSTOMER",
                            ObjID = data.ListCodeRelative[0].Code,
                            Relative = "MAIN",
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now,
                        };
                        _context.JcObjectIdRelatives.Add(JcObject);
                    }

                    card.LstUser = lstUser != null && lstUser.Any() ? string.Join(",", lstUser.Select(x => x.UserId)) : null;
                }
                _context.WORKOSCards.Add(card);
                _context.SaveChanges();
                msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer[""]);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                //msg.Title = String.Format(_stringLocalize["COM_MSG_ADD_FAILED"), _stringLocalize[""));//"Có lỗi xảy ra!";
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult DeleteCard(int Id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var userName = ESEIM.AppContext.UserName;
                var admin = "admin";
                //deleted card
                var data = _context.WORKOSCards.FirstOrDefault(x => x.CardID == Id);
                if (userName.ToLower() == admin.ToLower())
                {
                    if (data.Status == "TRASH")
                    {
                        data.IsDeleted = true;
                    }
                    else
                    {
                        data.Status = "TRASH";
                    }
                    //deleted relative
                    //var relative = _context.CardMappings.Where(x => x.CardCode == data.CardCode).AsNoTracking().ToList();
                    //_context.CardMappings.RemoveRange(relative);
                    //_cardService.UpdatePercentParentCard(data.CardCode);
                    var listJcObj = _context.JcObjectIdRelatives.Where(x => x.CardCode == data.CardCode);
                    foreach (var itemJcObj in listJcObj)
                    {
                        itemJcObj.IsDeleted = true;
                        _context.JcObjectIdRelatives.Update(itemJcObj);
                    }
                    _context.SaveChanges();

                    msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer[""]);// "Xóa thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["CJ_MSG_YOU_NOT_CREATED_CARD"];
                }
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Title = _sharedResources["COM_MSG_ERR"];
                //msg.Title = String.Format(_stringLocalize["COM_MSG_DELETE_FAIL"), _stringLocalize["")); //"Có lỗi xảy ra!";
                msg.Object = ex;
                return Json(msg);
            }
        }

        [HttpPost]
        public JsonResult UpdateCardName([FromBody]WORKOSCard obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = _context.WORKOSCards.FirstOrDefault(x => x.CardID == obj.CardID);
                if (data.CardName != obj.CardName)
                {
                    var activity = new CardUserActivity
                    {
                        UserId = ESEIM.AppContext.UserId,
                        Action = "UPDATE",
                        IdObject = "ITEMWORK",
                        IsCheck = true,
                        CardCode = data.CardCode,
                        CreatedTime = DateTime.Now,
                        FromDevice = "Laptop/Desktop",
                        ChangeDetails = "Tên thẻ việc từ [" + data.CardName + "] sang [" + obj.CardName + "]"
                    };
                    _context.CardUserActivitys.Add(activity);

                    data.CardName = obj.CardName;
                    data.UpdatedBy = ESEIM.AppContext.UserName;
                    data.UpdatedTime = DateTime.Now;
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer[""]);//"Thay đổi thành công!";
                }
            }
            catch (Exception ex)
            {
                msg.Object = ex;
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                // msg.Title = String.Format(_stringLocalize["COM_MSG_UPDATE_FAILED"), _stringLocalize[""));// "CÓ lỗi xảy ra!";
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateCardDescription([FromBody]DescriptionModel obj)
        {
            var msg = new JMessage() { Error = true };
            try
            {
                if (string.IsNullOrEmpty(obj.CardCode))
                {
                    return null;
                }
                var data = _context.WORKOSCards.FirstOrDefault(x => x.CardCode.Equals(obj.CardCode));
                if (!string.IsNullOrEmpty(data.Description) && data.Description.Equals(obj.Description))
                {
                    return null;
                }
                //log content
                var activity = new CardUserActivity
                {
                    UserId = ESEIM.AppContext.UserId,
                    Action = "UPDATE",
                    IdObject = "ITEMWORK",
                    IsCheck = true,
                    CardCode = obj.CardCode,
                    CreatedTime = DateTime.Now,
                    FromDevice = "Laptop/Desktop",
                    ChangeDetails = !string.IsNullOrEmpty(data.Description) ? "Mô tả từ " + data.Description + " sang " + obj.Description : "Mô tả thành " + obj.Description
                };
                _context.CardUserActivitys.Add(activity);

                data.Description = obj.Description;
                data.UpdatedTime = DateTime.Now;
                data.UpdatedBy = ESEIM.AppContext.UserName;

                _context.SaveChanges();

                msg.Title = _sharedResources["COM_UPDATE_SUCCESS"]; //"Cập nhật thành công";
                msg.Error = false;
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                //msg.Title = String.Format(_stringLocalize["COM_MSG_UPDATE_FAILED"), _stringLocalize[""));// "Có lỗi xảy ra!"; 
                return Json(msg);
            }
        }

        [HttpPost]
        public JsonResult UpdateCardLabel([FromBody]WORKOSCard obj)
        {
            var msg = new JMessage() { Error = true };
            try
            {
                var data = _context.WORKOSCards.FirstOrDefault(x => x.CardCode.Equals(obj.CardCode));
                data.Labels = obj.Labels;

                _context.SaveChanges();

                msg.Error = false;
                msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];//"Cập nhật thành công"; 
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                //msg.Title = String.Format(_stringLocalize["COM_MSG_UPDATE_FAILED"), _stringLocalize["")); // "Có lỗi xảy ra!"; 
                return Json(msg);
            }
        }

        [HttpPost]
        public JsonResult UpdateWeightNum([FromBody]WORKOSCard obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var card = _context.WORKOSCards.FirstOrDefault(x => x.CardCode == obj.CardCode && x.IsDeleted == false);
                if (card != null)
                {
                    if (card.WeightNum != obj.WeightNum)
                    {
                        var getSumWeightNum = _context.WORKOSCards.Where(x => x.ListCode == card.ListCode && x.CardCode != obj.CardCode && x.IsDeleted == false).Sum(x => x.WeightNum);
                        if ((getSumWeightNum + obj.WeightNum) > 100)
                        {
                            msg.Error = true;
                            msg.Title = _stringLocalizer["CJ_MSG_MAXIMUM_WEIGHT"] + (100 - getSumWeightNum) + " % !";
                        }
                        else
                        {
                            var data = _context.WORKOSCards.FirstOrDefault(x => x.CardCode.Equals(obj.CardCode));
                            //log content
                            var activity = new CardUserActivity
                            {
                                UserId = ESEIM.AppContext.UserId,
                                Action = "UPDATE",
                                IdObject = "ITEMWORK",
                                IsCheck = true,
                                CardCode = obj.CardCode,
                                CreatedTime = DateTime.Now,
                                FromDevice = "Laptop/Desktop",
                                ChangeDetails = "Trọng số từ " + data.WeightNum + " sang " + Convert.ToDecimal(obj.WeightNum)
                            };
                            _context.CardUserActivitys.Add(activity);

                            data.WeightNum = Convert.ToDecimal(obj.WeightNum);
                            data.UpdatedBy = ESEIM.AppContext.UserName;
                            data.UpdatedTime = DateTime.Now;
                            _context.WORKOSCards.Load();
                            msg.Object = _cardService.UpdatePercentParentCard(card.CardCode);
                            _context.SaveChanges();
                            msg.Title = _sharedResources["COM_UPDATE_SUCCESS"]; //"Cập nhật thành công";
                        }
                    }
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Thẻ không tồn tại!";
                    msg.Title = _stringLocalizer["CJ_MSG_CARD_NOT_EXISTS"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                //msg.Title = String.Format(_stringLocalize["COM_MSG_UPDATE_SUCCESS"), _stringLocalize[""));//"Có lỗi xảy ra!";
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateCost([FromBody]WORKOSCard obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var card = _context.WORKOSCards.FirstOrDefault(x => x.CardCode == obj.CardCode && x.IsDeleted == false);
                if (card != null)
                {
                    var data = _context.WORKOSCards.FirstOrDefault(x => x.CardCode.Equals(obj.CardCode));
                    if (data.Cost != obj.Cost)
                    {
                        data.Cost = obj.Cost;
                        data.UpdatedTime = DateTime.Now;
                        data.UpdatedBy = ESEIM.AppContext.UserName;
                        //msg.Object = _cardService.UpdatePercentParentCard(card.CardCode);
                        _context.SaveChanges();
                        //msg.Title = String.Format(_stringLocalize["COM_MSG_UPDATE_SUCCESS"), _stringLocalize["")); //"Cập nhật thành công";
                        msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                    }
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Thẻ không tồn tại!";
                    msg.Title = _stringLocalizer["CJ_MSG_CARD_NOT_EXISTS"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                //msg.Title = String.Format(_stringLocalize["COM_MSG_UPDATE_SUCCESS"), _stringLocalize[""));//"Có lỗi xảy ra!";
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateCurrenCy([FromBody]WORKOSCard obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var card = _context.WORKOSCards.FirstOrDefault(x => x.CardCode == obj.CardCode && x.IsDeleted == false);
                if (card != null)
                {
                    var data = _context.WORKOSCards.FirstOrDefault(x => x.CardCode.Equals(obj.CardCode));
                    data.Currency = obj.Currency;
                    msg.Object = _cardService.UpdatePercentParentCard(card.CardCode);
                    _context.SaveChanges();
                    //msg.Title = String.Format(_stringLocalize["COM_MSG_UPDATE_SUCCESS"), _stringLocalize["")); //"Cập nhật thành công";
                    msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Thẻ không tồn tại!";
                    msg.Title = _stringLocalizer["CJ_MSG_CARD_NOT_EXISTS"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                //msg.Title = String.Format(_stringLocalize["COM_MSG_UPDATE_SUCCESS"), _stringLocalize[""));//"Có lỗi xảy ra!";
            }
            return Json(msg);
        }

        [HttpGet]
        public JsonResult UpdateActivity(string CardCode, int Value, bool IsCheck)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var actionText = "";
                var userId = ESEIM.AppContext.UserId;
                if (Value == CardAction.Review.GetHashCode())
                {
                    actionText = EnumHelper<CardAction>.GetDisplayValue(CardAction.Review);
                }
                else if (Value == CardAction.Reject.GetHashCode())
                {
                    actionText = EnumHelper<CardAction>.GetDisplayValue(CardAction.Reject);
                    if (IsCheck)
                    {
                        RemoveUserReject(CardCode, userId);
                    }
                }
                else if (Value == CardAction.Accept.GetHashCode())
                {
                    actionText = EnumHelper<CardAction>.GetDisplayValue(CardAction.Accept);
                }
                if (actionText == EnumHelper<CardAction>.GetDisplayValue(CardAction.Review))
                {
                    var existActivity = _context.CardUserActivitys.FirstOrDefault(x => x.CardCode == CardCode && x.UserId == userId && x.Action == EnumHelper<CardAction>.GetDisplayValue(CardAction.Review));
                    if (existActivity != null)
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["CJ_MSG_YOU_WATCHED"];
                        return Json(msg);
                    }
                }
                if (IsCheck)
                {
                    var maxActionOther = _context.CardUserActivitys.Where(x => x.UserId == userId && x.CardCode == CardCode && x.Action != EnumHelper<CardAction>.GetDisplayValue(CardAction.Review) && x.Action != actionText).MaxBy(x => x.CreatedTime);
                    if (maxActionOther != null)
                    {
                        maxActionOther.IsCheck = false;
                    }
                }
                var activity = new CardUserActivity
                {
                    UserId = ESEIM.AppContext.UserId,
                    CardCode = CardCode,
                    Action = actionText,
                    IsCheck = IsCheck,
                    FromDevice = "Laptop/Desktop",
                    CreatedTime = DateTime.Now
                };
                _context.CardUserActivitys.Add(activity);
                _context.SaveChanges();
                msg.Object = new
                {
                    Date = activity.CreatedTime.ToString("dd/MM/yyyy"),
                    Time = activity.CreatedTime.ToString("hh:mm:ss"),
                    TimeActivity = DateTime.Now
                };
                msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [NonAction]
        public void RemoveUserReject(string cardCode, string userId)
        {
            var query = (from a in _context.CardMappings
                         join b in _context.Users on a.UserId equals b.Id
                         where a.CardCode == cardCode
                         select new CardMemberCustom
                         {
                             Id = a.Id,
                             UserId = a.UserId,
                             CreatedTime = a.CreatedTime.ToString("dd/MM/yyyy"),
                             Responsibility = a.Responsibility
                         });
            foreach (var item in query)
            {
                if (item.UserId == userId)
                {
                    var mapping = _context.CardMappings.FirstOrDefault(x => x.Id == item.Id && x.CardCode == cardCode);
                    _context.CardMappings.Remove(mapping);
                    query.ToList().Remove(item);
                    break;
                }
            }
            var card = _context.WORKOSCards.FirstOrDefault(x => !x.IsDeleted && x.Status != "TRASH" && x.CardCode == cardCode);
            var listUser = !string.IsNullOrEmpty(card.LstUser) ? card.LstUser.Split(",", StringSplitOptions.None) : new string[0];
            //var lstUser = new List<string>(listUser);
            foreach (var item in listUser)
            {
                if (item == userId)
                {
                    listUser.ToList().Remove(item);
                    //lstUser.Remove(item);
                }
            }
            card.LstUser = listUser != null && listUser.Any() ? string.Join(",", listUser) : null;
            var list = _context.WORKOSLists.FirstOrDefault(x => x.ListCode == card.ListCode && !x.IsDeleted);
            var board = _context.WORKOSBoards.FirstOrDefault(x => x.BoardCode == list.BoardCode && !x.IsDeleted);

            SendPushNotification(query, string.Format("Thẻ việc: {0} mới cập nhật", card.CardName), new
            {
                board.BoardCode,
                board.BoardName,
                list.ListCode,
                card.CardCode,
                card.CardName,
                card.BeginTime,
                card.EndTime,
                card.CardID,
                card.CardLevel,
                card.Deadline,
                card.Currency,
                card.Completed,
                card.Cost,
                Type = board.BoardType == "BOARD_REPEAT" ? "REPEAT" : board.BoardType == "BOARD_PROJECT" ? "PROJECT" : "BUILDING",
                ProjectCode = "",
                ProjectName = "",
            });
        }

        [HttpPost]
        public JsonResult UpdateAddress([FromBody] dynamic obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                string cardCode = obj.cardCode.Value;
                string address = obj.address.Value;
                decimal lat = obj.lat.Value != null ? Convert.ToDecimal(obj.lat.Value) : 0;
                decimal lng = obj.lng.Value != null ? Convert.ToDecimal(obj.lng.Value) : 0;
                var data = _context.WORKOSCards.FirstOrDefault(x => x.CardCode == cardCode);
                if (data != null)
                {
                    data.LocationText = address;
                    data.LocationGps = string.Concat(lat, ",", lng);
                    data.UpdatedBy = ESEIM.AppContext.UserName;
                    data.UpdatedTime = DateTime.Now;
                    _context.SaveChanges();
                    //msg.Title = "Cập nhập địa điểm làm việc thành công";
                    msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["CJ_MSG_WORKING_PLACE"]);
                }
                else
                {
                    //msg.Title = "Thẻ không tồn tại!";
                    msg.Title = _stringLocalizer["CJ_MSG_CARD_NOT_EXISTS"];
                    msg.Error = true;
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                //msg.Title = "Có lỗi khi cập nhập địa chỉ";
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateProgress([FromBody]WORKOSCard obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                if (obj.Progress < 100)
                {
                    var data = _context.WORKOSCards.FirstOrDefault(x => x.CardCode == obj.CardCode);
                    if (data != null)
                    {
                        data.Progress = obj.Progress;
                        data.UpdatedTime = DateTime.Now;
                        data.UpdatedBy = ESEIM.AppContext.UserName;

                        var progressTracking = new ProgressTracking
                        {
                            CardCode = data.CardCode,
                            Progress = data.Progress,
                            UpdatedBy = ESEIM.AppContext.UserName,
                            UpdatedTime = DateTime.Now
                        };
                        _context.ProgressTrackings.Add(progressTracking);
                        _context.SaveChanges();
                        //msg.Title = "Cập nhập tiến độ thực tế thành công!";
                        msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["CJ_MSG_REAL_PROGRESS"]);
                    }
                    else
                    {
                        //msg.Title = "Thẻ không tồn tại!";
                        msg.Title = _stringLocalizer["CJ_MSG_CARD_NOT_EXISTS"];
                        msg.Error = true;
                    }
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Tiến độ đã vượt quá 100%";
                    msg.Title = _stringLocalizer["CJ_MSG_PROGRESS_OVER_HUNDRED_PRECENT"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                //msg.Title = "Có lỗi khi cập nhập tiến độ";
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateBeginTime(string CardCode, string BeginTime)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var beginTime = DateTime.ParseExact(BeginTime, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                var data = _context.WORKOSCards.FirstOrDefault(x => x.CardCode == CardCode);
                if (data != null)
                {
                    if (data.EndTime != null)
                    {
                        if (beginTime.Date > data.EndTime.Value.Date)
                        {
                            msg.Error = true;
                            //msg.Title = "Ngày bắt đầu nhỏ hơn hoặc bằng ngày kết thúc!";
                            msg.Title = _stringLocalizer["CJ_MSG_START_DATE_LESS_EQUAL_END_DATE"];
                            return Json(msg);
                        }
                    }
                }
                var activity = new CardUserActivity
                {
                    UserId = ESEIM.AppContext.UserId,
                    Action = "UPDATE",
                    IdObject = "ITEMWORK",
                    IsCheck = true,
                    CardCode = CardCode,
                    CreatedTime = DateTime.Now,
                    FromDevice = "Laptop/Desktop",
                    ChangeDetails = "Ngày bắt đầu từ " + data.BeginTime.ToString("dd/MM/yyyy") + " sang " + beginTime.ToString("dd/MM/yyyy")
                };
                _context.CardUserActivitys.Add(activity);
                data.BeginTime = beginTime;
                _context.SaveChanges();
                //msg.Title = "Cập nhập thành công!";
                msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                //msg.Title = "Có lỗi khi cập nhập";
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateEndTime(string CardCode, string EndTime)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var endTime = DateTime.ParseExact(EndTime, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                var data = _context.WORKOSCards.FirstOrDefault(x => x.CardCode == CardCode);
                if (data != null)
                {
                    if (endTime.Date < data.Deadline.Date)
                    {
                        msg.Error = true;
                        //msg.Title = "Ngày kết thúc lớn hơn hoặc bằng ngày bắt đầu!";
                        msg.Title = _stringLocalizer["CJ_MSG_END_DATE_GREATER_EQUAL_START_DATE"];
                        return Json(msg);
                    }
                }
                var activity = new CardUserActivity
                {
                    UserId = ESEIM.AppContext.UserId,
                    Action = "UPDATE",
                    IdObject = "ITEMWORK",
                    IsCheck = true,
                    CardCode = CardCode,
                    CreatedTime = DateTime.Now,
                    FromDevice = "Laptop/Desktop",
                    ChangeDetails = data.EndTime.HasValue ? "Ngày kết thúc từ " + data.EndTime.Value.ToString("dd/MM/yyyy") + " sang " + endTime.ToString("dd/MM/yyyy") : "Ngày kết thúc " + endTime.ToString("dd/MM/yyyy")
                };
                _context.CardUserActivitys.Add(activity);
                data.EndTime = endTime;
                _context.SaveChanges();
                // msg.Title = "Cập nhập thành công!";
                msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                //msg.Title = "Có lỗi khi cập nhập";
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateDeadLine(string CardCode, string DeadLine)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var deadLine = DateTime.ParseExact(DeadLine, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                var data = _context.WORKOSCards.FirstOrDefault(x => x.CardCode == CardCode);
                if (deadLine < data.BeginTime)
                {
                    msg.Error = true;
                    //msg.Title = "Ngày hết hạn không được nhỏ hơn ngày bắt đầu";
                    msg.Title = _stringLocalizer["CJ_MSG_DATE_EXPERIED_NOT_LESS_START_DATE"];
                }
                else
                {
                    var activity = new CardUserActivity
                    {
                        UserId = ESEIM.AppContext.UserId,
                        Action = "UPDATE",
                        IdObject = "ITEMWORK",
                        IsCheck = true,
                        CardCode = CardCode,
                        CreatedTime = DateTime.Now,
                        FromDevice = "Laptop/Desktop",
                        ChangeDetails = "Ngày hết hạn từ " + data.Deadline.ToString("dd/MM/yyyy") + " sang " + deadLine.ToString("dd/MM/yyyy")
                    };
                    _context.CardUserActivitys.Add(activity);
                    data.Deadline = deadLine;
                    _context.SaveChanges();
                    //msg.Title = "Cập nhập thành công!";
                    msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                //msg.Title = "Có lỗi khi cập nhập";
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateQuantitative(string CardCode, decimal Quantitative)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = _context.WORKOSCards.FirstOrDefault(x => x.CardCode == CardCode);
                if (data.Quantitative != Quantitative)
                {
                    data.Quantitative = Quantitative;
                    _context.SaveChanges();
                    //msg.Title = "Cập nhập thành công!";
                    msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                //msg.Title = "Có lỗi khi cập nhập";
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateUnit(string CardCode, string Unit)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = _context.WORKOSCards.FirstOrDefault(x => x.CardCode == CardCode);
                data.Unit = Unit;
                _context.SaveChanges();
                //msg.Title = "Cập nhập thành công!";
                msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                //msg.Title = "Có lỗi khi cập nhập";
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult ChangeWorkType(string CardCode, string Type)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = _context.WORKOSCards.FirstOrDefault(x => x.CardCode.Equals(CardCode));
                //log content
                var activity = new CardUserActivity
                {
                    UserId = ESEIM.AppContext.UserId,
                    Action = "UPDATE",
                    IdObject = "ITEMWORK",
                    IsCheck = true,
                    CardCode = CardCode,
                    CreatedTime = DateTime.Now,
                    FromDevice = "Laptop/Desktop",
                    ChangeDetails = "Kiểu công việc từ " + (_context.CommonSettings.FirstOrDefault(x => x.CodeSet == data.WorkType && !x.IsDeleted) != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet == data.WorkType && !x.IsDeleted).ValueSet : "")
                    + " sang " + (_context.CommonSettings.FirstOrDefault(x => x.CodeSet == Type && !x.IsDeleted) != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet == Type && !x.IsDeleted).ValueSet : "")
                };
                _context.CardUserActivitys.Add(activity);

                data.WorkType = Type;
                _context.SaveChanges();

                msg.Title = _sharedResources["COM_UPDATE_SUCCESS"]; ;// "Cập nhật thành công";
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                //msg.Title = String.Format(_stringLocalize["COM_MSG_ERR"), _stringLocalize[""));// "Có lỗi xảy ra!";
                msg.Object = ex;
                return Json(msg);
            }
        }

        [HttpPost]
        public JsonResult ChangeListCard(string CardCode, string ListCode)
        {
            var msg = new JMessage() { Error = true };
            try
            {
                var data = _context.WORKOSCards.FirstOrDefault(x => x.CardCode.Equals(CardCode));
                data.ListCode = ListCode;
                _context.SaveChanges();

                msg.Error = false;
                msg.Title = _stringLocalizer["CJ_CURD_MSG_CHANGE_LIST_CARD_SUCCESS"];//"Di chuyển thành công";
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                return Json(msg);
            }
        }

        [HttpPost]
        public JsonResult ChangeCardStatus(string CardCode, string Status)
        {
            var msg = new JMessage() { Error = true };
            try
            {
                var data = _context.WORKOSCards.FirstOrDefault(x => x.CardCode.Equals(CardCode));
                if (data.Completed < 100 && Status == "DONE")
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["CJ_MSG_CARD_NOT_SUCCESS"];
                }
                else
                {
                    if (!data.Status.Equals(Status))
                    {
                        //log content
                        var activity = new CardUserActivity
                        {
                            UserId = ESEIM.AppContext.UserId,
                            Action = "UPDATE",
                            IdObject = "ITEMWORK",
                            IsCheck = true,
                            CardCode = CardCode,
                            CreatedTime = DateTime.Now,
                            FromDevice = "Laptop/Desktop",
                            ChangeDetails = "Trạng thái từ " + _context.CommonSettings.FirstOrDefault(x => x.CodeSet == data.Status && !x.IsDeleted).ValueSet
                            + " sang " + _context.CommonSettings.FirstOrDefault(x => x.CodeSet == Status && !x.IsDeleted).ValueSet
                        };
                        _context.CardUserActivitys.Add(activity);

                        data.Status = Status;
                        _context.SaveChanges();
                    }

                    msg.Error = false;
                    msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["CJ_COL_STATUS"]);//"Cập nhật trạng thái thành công";
                }

                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Title = _sharedResources["COM_MSG_ERR"];
                // msg.Title = String.Format(_stringLocalize["COM_MSG_UPDATE_FAILED"), _stringLocalize["CJ_COL_STATUS")); //"Có lỗi xảy ra!";
                msg.Object = ex;
                return Json(msg);
            }
        }

        [HttpPost]
        public JsonResult ChangeCardLevel(string CardCode, string Level)
        {
            var msg = new JMessage() { Error = true };
            try
            {
                var data = _context.WORKOSCards.FirstOrDefault(x => x.CardCode.Equals(CardCode));
                //log content
                var activity = new CardUserActivity
                {
                    UserId = ESEIM.AppContext.UserId,
                    Action = "UPDATE",
                    IdObject = "ITEMWORK",
                    IsCheck = true,
                    CardCode = CardCode,
                    CreatedTime = DateTime.Now,
                    FromDevice = "Laptop/Desktop",
                    ChangeDetails = "Độ ưu tiên từ " + (_context.CommonSettings.FirstOrDefault(x => x.CodeSet == data.CardLevel && !x.IsDeleted) != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet == data.CardLevel && !x.IsDeleted).ValueSet : "")
                    + " sang " + (_context.CommonSettings.FirstOrDefault(x => x.CodeSet == Level && !x.IsDeleted) != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet == Level && !x.IsDeleted).ValueSet : "")
                };
                _context.CardUserActivitys.Add(activity);

                data.CardLevel = Level;
                _context.SaveChanges();

                msg.Error = false;
                //msg.Title = String.Format(_stringLocalize["COM_MSG_UPDATE_SUCCESS"), _stringLocalize[""));//"Cập nhật cấp độ thành công";
                msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                return Json(msg);
            }
            catch (Exception ex)
            {
                //msg.Title = String.Format(_stringLocalize["CJ_CURD_MSG_ERROR"));// //"Có lỗi xảy ra!";
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Object = ex;
                return Json(msg);
            }
        }

        [HttpPost]
        public JsonResult UpdateCardByBufferData([FromBody] BufferData buffer)
        {
            var timeEnd = DateTime.Now;
            //Update card base
            var msg = new JMessage();
            try
            {
                var card = _context.WORKOSCards.FirstOrDefault(x => x.CardCode == buffer.CardJob.CardCode && !x.IsDeleted);
                var list = _context.WORKOSLists.FirstOrDefault(x => x.ListCode == card.ListCode);
                var board = _context.WORKOSBoards.FirstOrDefault(x => x.BoardCode == list.BoardCode);
                if (card != null)
                {
                    //Inherit
                    if (buffer.CardJob.Inherit != card.Inherit)
                        ChangeInheritInBuffer(card, buffer.CardJob.Inherit);

                    //Update card base
                    if (string.IsNullOrEmpty(buffer.CardJob.BeginTime))
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["CJ_MSG_PLS_ENTER_START_DATE"];
                        return Json(msg);
                    }
                    if (string.IsNullOrEmpty(buffer.CardJob.Deadline))
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["CJ_MSG_PLS_ENTER_END_DATE"];
                        return Json(msg);
                    }

                    var getSumWeightNum = _context.WORKOSCards.Where(x => x.ListCode == card.ListCode && x.CardCode != card.CardCode && x.IsDeleted == false).Sum(x => x.WeightNum);
                    if ((getSumWeightNum + Decimal.Parse(buffer.CardJob.WeightNum)) > 100)
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["CJ_MSG_MAXIMUM_WEIGHT"] + (100 - getSumWeightNum) + " % !";
                        return Json(msg);
                    }
                    var beginTime = !string.IsNullOrEmpty(buffer.CardJob.BeginTime) ? DateTime.ParseExact(buffer.CardJob.BeginTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                    var deadLine = !string.IsNullOrEmpty(buffer.CardJob.Deadline) ? DateTime.ParseExact(buffer.CardJob.Deadline, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                    var endTime = !string.IsNullOrEmpty(buffer.CardJob.EndTime) ? DateTime.ParseExact(buffer.CardJob.EndTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                    //Log
                    if (card.BeginTime != beginTime)
                    {
                        var activity = new CardUserActivity
                        {
                            UserId = ESEIM.AppContext.UserId,
                            Action = "UPDATE",
                            IdObject = "ITEMWORK",
                            IsCheck = true,
                            CardCode = card.CardCode,
                            CreatedTime = DateTime.Now,
                            FromDevice = "Laptop/Desktop",
                            ChangeDetails = "Ngày bắt đầu từ " + card.BeginTime != null ? card.BeginTime.ToString("dd/MM/yyyy") : "trống" + " sang " + beginTime != null ? beginTime.Value.ToString("dd/MM/yyyy") : "trống"
                        };
                        _context.CardUserActivitys.Add(activity);
                    }
                    if (card.CardName != buffer.CardJob.CardName)
                    {
                        var activity = new CardUserActivity
                        {
                            UserId = ESEIM.AppContext.UserId,
                            Action = "UPDATE",
                            IdObject = "ITEMWORK",
                            IsCheck = true,
                            CardCode = card.CardCode,
                            CreatedTime = DateTime.Now,
                            FromDevice = "Laptop/Desktop",
                            ChangeDetails = "Tên thẻ việc từ [" + card.CardName + "] sang [" + buffer.CardJob.CardName + "]"
                        };
                        _context.CardUserActivitys.Add(activity);
                    }
                    if (card.Deadline != deadLine)
                    {
                        var activity = new CardUserActivity
                        {
                            UserId = ESEIM.AppContext.UserId,
                            Action = "UPDATE",
                            IdObject = "ITEMWORK",
                            IsCheck = true,
                            CardCode = card.CardCode,
                            CreatedTime = DateTime.Now,
                            FromDevice = "Laptop/Desktop",
                            ChangeDetails = "Ngày hết hạn từ " + card.Deadline != null ? card.Deadline.ToString("dd/MM/yyyy") : "trống" + " sang " + deadLine != null ? deadLine.Value.ToString("dd/MM/yyyy") : "trống"
                        };
                        _context.CardUserActivitys.Add(activity);
                    }
                    if (card.EndTime != endTime)
                    {
                        var activity = new CardUserActivity
                        {
                            UserId = ESEIM.AppContext.UserId,
                            Action = "UPDATE",
                            IdObject = "ITEMWORK",
                            IsCheck = true,
                            CardCode = card.CardCode,
                            CreatedTime = DateTime.Now,
                            FromDevice = "Laptop/Desktop",
                            ChangeDetails = card.EndTime.HasValue ? "Ngày kết thúc từ " + card.EndTime.Value.ToString("dd/MM/yyyy") + " sang " + (endTime.HasValue ? endTime.Value.ToString("dd/MM/yyyy") : "trống") : "Ngày kết thúc " + (endTime.HasValue ? endTime.Value.ToString("dd/MM/yyyy") : "trống")
                        };
                        _context.CardUserActivitys.Add(activity);
                    }
                    if (card.Description != buffer.CardJob.Description)
                    {
                        var activity = new CardUserActivity
                        {
                            UserId = ESEIM.AppContext.UserId,
                            Action = "UPDATE",
                            IdObject = "ITEMWORK",
                            IsCheck = true,
                            CardCode = card.CardCode,
                            CreatedTime = DateTime.Now,
                            FromDevice = "Laptop/Desktop",
                            ChangeDetails = !string.IsNullOrEmpty(card.Description) ? "Mô tả từ " + card.Description + " sang " + buffer.CardJob.Description : "Thêm mới mô tả " + buffer.CardJob.Description
                        };
                        _context.CardUserActivitys.Add(activity);
                    }
                    if (card.WorkType != buffer.CardJob.WorkType)
                    {
                        var activity = new CardUserActivity
                        {
                            UserId = ESEIM.AppContext.UserId,
                            Action = "UPDATE",
                            IdObject = "ITEMWORK",
                            IsCheck = true,
                            CardCode = card.CardCode,
                            CreatedTime = DateTime.Now,
                            FromDevice = "Laptop/Desktop",
                            ChangeDetails = !string.IsNullOrEmpty(card.WorkType) ? "Kiểu công việc từ " + (_context.CommonSettings.FirstOrDefault(x => x.CodeSet == card.WorkType && !x.IsDeleted) != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet == card.WorkType && !x.IsDeleted).ValueSet : "")
                    + " sang " + (_context.CommonSettings.FirstOrDefault(x => x.CodeSet == buffer.CardJob.WorkType && !x.IsDeleted) != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet == buffer.CardJob.WorkType && !x.IsDeleted).ValueSet : "") : "Thêm mới kiểu công việc " + _context.CommonSettings.FirstOrDefault(x => x.CodeSet == buffer.CardJob.WorkType && !x.IsDeleted).ValueSet
                        };
                        _context.CardUserActivitys.Add(activity);
                    }
                    if (card.CardLevel != buffer.CardJob.CardLevel)
                    {
                        var activity = new CardUserActivity
                        {
                            UserId = ESEIM.AppContext.UserId,
                            Action = "UPDATE",
                            IdObject = "ITEMWORK",
                            IsCheck = true,
                            CardCode = card.CardCode,
                            CreatedTime = DateTime.Now,
                            FromDevice = "Laptop/Desktop",
                            ChangeDetails = !(string.IsNullOrEmpty(card.CardLevel)) ? "Độ ưu tiên từ " + (_context.CommonSettings.FirstOrDefault(x => x.CodeSet == card.CardLevel && !x.IsDeleted) != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet == card.CardLevel && !x.IsDeleted).ValueSet : "")
                    + " sang " + (_context.CommonSettings.FirstOrDefault(x => x.CodeSet == buffer.CardJob.CardLevel && !x.IsDeleted) != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet == buffer.CardJob.CardLevel && !x.IsDeleted).ValueSet : "") : "Thêm mới độ ưu tiên " + _context.CommonSettings.FirstOrDefault(x => x.CodeSet == buffer.CardJob.CardLevel && !x.IsDeleted).ValueSet
                        };
                        _context.CardUserActivitys.Add(activity);
                    }
                    if (card.WeightNum != Decimal.Parse(buffer.CardJob.WeightNum))
                    {
                        var activity = new CardUserActivity
                        {
                            UserId = ESEIM.AppContext.UserId,
                            Action = "UPDATE",
                            IdObject = "ITEMWORK",
                            IsCheck = true,
                            CardCode = card.CardCode,
                            CreatedTime = DateTime.Now,
                            FromDevice = "Laptop/Desktop",
                            ChangeDetails = "Trọng số từ " + card.WeightNum + " sang " + Convert.ToDecimal(buffer.CardJob.WeightNum)
                        };
                        _context.CardUserActivitys.Add(activity);
                    }
                    if (card.Status != buffer.CardJob.Status)
                    {
                        var activity = new CardUserActivity
                        {
                            UserId = ESEIM.AppContext.UserId,
                            Action = "UPDATE",
                            IdObject = "ITEMWORK",
                            IsCheck = true,
                            CardCode = card.CardCode,
                            CreatedTime = DateTime.Now,
                            FromDevice = "Laptop/Desktop",
                            ChangeDetails = "Trạng thái từ " + _context.CommonSettings.FirstOrDefault(x => x.CodeSet == card.Status && !x.IsDeleted).ValueSet
                            + " sang " + _context.CommonSettings.FirstOrDefault(x => x.CodeSet == buffer.CardJob.Status && !x.IsDeleted).ValueSet
                        };
                        _context.CardUserActivitys.Add(activity);
                    }

                    card.CardName = buffer.CardJob.CardName;
                    card.BeginTime = beginTime.Value;
                    card.Deadline = deadLine.Value;
                    card.EndTime = endTime;
                    card.Description = buffer.CardJob.Description;
                    card.WorkType = buffer.CardJob.WorkType;
                    card.Status = buffer.CardJob.Status;
                    card.WeightNum = Decimal.Parse(buffer.CardJob.WeightNum);
                    card.CardLevel = buffer.CardJob.CardLevel;
                    card.Inherit = buffer.CardJob.Inherit;
                    card.Completed = buffer.CardJob.Completed;
                    card.UpdatedTime = DateTime.Now;
                    card.UpdatedBy = ESEIM.AppContext.UserName;
                    card.ListCode = buffer.CardJob.ListCode;

                    // Update đối tượng liên quan
                    if (buffer.JcRelative.ListDelRelative.Count > 0)
                    {
                        foreach (var item in buffer.JcRelative.ListDelRelative)
                        {
                            int idDeleted = !string.IsNullOrEmpty(item) ? Convert.ToInt32(item) : 0;
                            if (idDeleted > 0)
                            {
                                var currentData = _context.JcObjectIdRelatives.FirstOrDefault(x => x.ID == idDeleted);
                                if (currentData != null)
                                {
                                    currentData.IsDeleted = true;
                                    currentData.DeletedBy = ESEIM.AppContext.UserName;
                                    currentData.DeletedTime = DateTime.Now;
                                    _context.JcObjectIdRelatives.Update(currentData);
                                }
                            }
                        }
                    }
                    if (buffer.JcRelative.ListRelative.Count > 0)
                    {
                        foreach (var item in buffer.JcRelative.ListRelative)
                        {
                            if (item.ID < 0)
                            {
                                var objRelative = new JcObjectIdRelative();
                                decimal weight = !string.IsNullOrEmpty(item.Weight) ? Convert.ToDecimal(item.Weight) : 0;
                                objRelative.Weight = weight;
                                objRelative.CardCode = card.CardCode;
                                objRelative.ObjTypeCode = item.ObjTypeCode;
                                objRelative.ObjID = item.ObjID;
                                objRelative.Relative = item.RelativeCode;
                                objRelative.CreatedBy = ESEIM.AppContext.UserName;
                                objRelative.CreatedTime = DateTime.Now;
                                _context.JcObjectIdRelatives.Add(objRelative);

                                if (objRelative.ObjTypeCode == "PROJECT")
                                {
                                    var objCardMap = new CardMapping();
                                    objCardMap.ListCode = card.ListCode;
                                    objCardMap.BoardCode = list.BoardCode;
                                    objCardMap.ProjectCode = objRelative.ObjID;
                                    objCardMap.CardCode = card.CardCode;
                                    objCardMap.CreatedBy = ESEIM.AppContext.UserName;
                                    objCardMap.CreatedTime = DateTime.Now;
                                    _context.CardMappings.Add(objCardMap);
                                };
                                if (objRelative.ObjTypeCode == "CONTRACT")
                                {
                                    var objCardMap = new CardMapping();
                                    objCardMap.ListCode = list.ListCode;
                                    objCardMap.BoardCode = list.BoardCode;
                                    objCardMap.ContractCode = objRelative.ObjID;
                                    objCardMap.CardCode = card.CardCode;
                                    objCardMap.CreatedBy = ESEIM.AppContext.UserName;
                                    objCardMap.CreatedTime = DateTime.Now;
                                    _context.CardMappings.Add(objCardMap);
                                };
                            }
                        }
                    }

                    //Update cardlink
                    if (buffer.CardLink.ListCardLinkDel.Count > 0)
                    {
                        foreach (var item in buffer.CardLink.ListCardLinkDel)
                        {
                            var data = _context.JobCardLinks.FirstOrDefault(x => !x.IsDeleted && x.Id == item);
                            if (data != null)
                            {
                                data.IsDeleted = true;
                                data.DeletedBy = ESEIM.AppContext.UserName;
                                data.DeletedTime = DateTime.Now;
                                _context.JobCardLinks.Update(data);

                                var activity = new CardUserActivity
                                {
                                    UserId = ESEIM.AppContext.UserId,
                                    Action = "DELETE",
                                    IdObject = "CARDLINK",
                                    IsCheck = true,
                                    CardCode = data.CardCode,
                                    CreatedTime = DateTime.Now,
                                    FromDevice = "Laptop/Desktop",
                                    ChangeDetails = "Thẻ việc liên kết " + _context.WORKOSCards.FirstOrDefault(x => x.CardCode == data.CardLink).CardName
                                };
                                _context.CardUserActivitys.Add(activity);
                            }
                        }
                    }
                    if (buffer.CardLink.ListCardLink.Count > 0)
                    {
                        foreach (var item in buffer.CardLink.ListCardLink)
                        {
                            var data = _context.JobCardLinks.FirstOrDefault(x => !x.IsDeleted && x.CardCode == card.CardCode && x.CardLink == item.Code);
                            if (data == null)
                            {
                                var link = new JobCardLink
                                {
                                    CardCode = card.CardCode,
                                    CardLink = item.Code,
                                    CreatedBy = ESEIM.AppContext.UserName,
                                    CreatedTime = DateTime.Now
                                };
                                _context.JobCardLinks.Add(link);

                                var activity = new CardUserActivity
                                {
                                    UserId = ESEIM.AppContext.UserId,
                                    Action = "ADD",
                                    IdObject = "CARDLINK",
                                    IsCheck = true,
                                    CardCode = card.CardCode,
                                    CreatedTime = DateTime.Now,
                                    FromDevice = "Laptop/Desktop",
                                    ChangeDetails = "Thẻ việc liên kết " + _context.WORKOSCards.FirstOrDefault(x => x.CardCode == link.CardLink).CardName
                                };
                                _context.CardUserActivitys.Add(activity);
                            }
                        }
                    }

                    //Update Product
                    if (buffer.ProductBuffer.ListProduct.Count > 0)
                    {
                        foreach (var item in buffer.ProductBuffer.ListProduct)
                        {
                            var checkProduct = _context.JcProducts.FirstOrDefault(x => x.CardCode == card.CardCode && x.ProductCode == item.ProductCode && !x.IsDeleted);
                            if (checkProduct != null)
                            {
                                checkProduct.Quantity = item.Quantity;
                                checkProduct.UpdatedBy = ESEIM.AppContext.UserName;
                                checkProduct.UpdatedTime = DateTime.Now;
                                _context.JcProducts.Update(checkProduct);
                            }
                            else
                            {
                                var product = new JcProduct
                                {
                                    ProductCode = item.ProductCode,
                                    Quantity = item.Quantity,
                                    JcAct = item.JcAct,
                                    CardCode = card.CardCode,
                                    CreatedBy = item.CreatedBy,
                                    CreatedTime = DateTime.Now
                                };
                                _context.JcProducts.Add(product);
                                //Log
                                var activity = new CardUserActivity
                                {
                                    UserId = ESEIM.AppContext.UserId,
                                    IdObject = "PROD",
                                    Action = "ADD",
                                    IsCheck = true,
                                    CardCode = product.CardCode,
                                    CreatedTime = DateTime.Now,
                                    FromDevice = "Laptop/Desktop",
                                    ChangeDetails = _context.MaterialProducts.FirstOrDefault(x => x.ProductCode == product.ProductCode).ProductName
                                };
                                _context.CardUserActivitys.Add(activity);
                            }
                        }
                    }
                    if (buffer.ProductBuffer.ListDelProduct.Count > 0)
                    {
                        foreach (var item in buffer.ProductBuffer.ListDelProduct)
                        {
                            var cardProduct = _context.JcProducts.FirstOrDefault(x => x.ID == item);
                            if (cardProduct != null)
                            {
                                cardProduct.IsDeleted = true;
                                cardProduct.DeletedBy = ESEIM.AppContext.UserName;
                                cardProduct.DeletedTime = DateTime.Now;
                                _context.JcProducts.Update(cardProduct);

                                //Log
                                var activity = new CardUserActivity
                                {
                                    UserId = ESEIM.AppContext.UserId,
                                    IdObject = "PROD",
                                    Action = "DELETE",
                                    IsCheck = true,
                                    CardCode = card.CardCode,
                                    CreatedTime = DateTime.Now,
                                    FromDevice = "Laptop/Desktop",
                                    ChangeDetails = _context.MaterialProducts.FirstOrDefault(x => x.ProductCode == cardProduct.ProductCode).ProductName
                                };
                                _context.CardUserActivitys.Add(activity);
                            }
                        }
                    }

                    //Update service
                    if (buffer.ServiceBuffer.ListService.Count > 0)
                    {
                        foreach (var item in buffer.ServiceBuffer.ListService)
                        {
                            var checkSer = _context.JcServices.FirstOrDefault(x => x.CardCode == card.CardCode && x.ServiceCode == item.ServiceCode && !x.IsDeleted);
                            if (checkSer != null)
                            {
                                checkSer.Quantity = item.Quantity;
                                checkSer.UpdatedBy = ESEIM.AppContext.UserName;
                                checkSer.UpdatedTime = DateTime.Now;
                                _context.JcServices.Update(checkSer);
                            }
                            else
                            {
                                var ser = new JcService
                                {
                                    CardCode = card.CardCode,
                                    ServiceCode = item.ServiceCode,
                                    Quantity = item.Quantity,
                                    JcAct = item.JcAct,
                                    CreatedBy = ESEIM.AppContext.UserName,
                                    CreatedTime = DateTime.Now
                                };
                                _context.JcServices.Add(ser);

                                //Log
                                var activity = new CardUserActivity
                                {
                                    UserId = ESEIM.AppContext.UserId,
                                    IdObject = "SER",
                                    Action = "ADD",
                                    IsCheck = true,
                                    CardCode = ser.CardCode,
                                    CreatedTime = DateTime.Now,
                                    FromDevice = "Laptop/Desktop",
                                    ChangeDetails = _context.ServiceCategorys.FirstOrDefault(x => !x.IsDeleted && x.ServiceCode == ser.ServiceCode).ServiceName
                                };
                                _context.CardUserActivitys.Add(activity);
                            }
                        }
                    }
                    if (buffer.ServiceBuffer.ListDelService.Count > 0)
                    {
                        foreach (var item in buffer.ServiceBuffer.ListDelService)
                        {
                            var cardService = _context.JcServices.FirstOrDefault(x => x.ID == item);
                            if (cardService != null)
                            {
                                cardService.IsDeleted = true;
                                cardService.DeletedBy = ESEIM.AppContext.UserName;
                                cardService.DeletedTime = DateTime.Now;
                                _context.JcServices.Update(cardService);

                                var activity = new CardUserActivity
                                {
                                    UserId = ESEIM.AppContext.UserId,
                                    IdObject = "SER",
                                    Action = "DELETE",
                                    IsCheck = true,
                                    CardCode = cardService.CardCode,
                                    CreatedTime = DateTime.Now,
                                    FromDevice = "Laptop/Desktop",
                                    ChangeDetails = _context.ServiceCategorys.FirstOrDefault(x => !x.IsDeleted && x.ServiceCode == cardService.ServiceCode).ServiceName
                                };
                                _context.CardUserActivitys.Add(activity);
                            }
                        }
                    }

                    //Update address
                    if (buffer.AddressBuffer.ListAddress.Count > 0)
                    {
                        foreach (var item in buffer.AddressBuffer.ListAddress)
                        {
                            if (item.Id < 0)
                            {
                                var address = new WORKOSAddressCard
                                {
                                    CardCode = card.CardCode,
                                    LocationGps = item.LocationGps,
                                    LocationText = item.LocationText,
                                    CreatedBy = item.CreatedBy,
                                    CreatedTime = DateTime.Now
                                };
                                _context.WORKOSAddressCards.Add(address);

                                var activity = new CardUserActivity
                                {
                                    UserId = ESEIM.AppContext.UserId,
                                    IdObject = "ADDR",
                                    Action = "ADD",
                                    IsCheck = true,
                                    CardCode = card.CardCode,
                                    CreatedTime = DateTime.Now,
                                    FromDevice = "Laptop/Desktop",
                                    ChangeDetails = address.LocationText
                                };
                                _context.CardUserActivitys.Add(activity);
                            }
                        }
                    }
                    if (buffer.AddressBuffer.ListDelAddress.Count > 0)
                    {
                        foreach (var item in buffer.AddressBuffer.ListDelAddress)
                        {
                            var address = _context.WORKOSAddressCards.FirstOrDefault(x => x.Id == item && !x.IsDeleted);
                            if (address != null)
                            {
                                address.IsDeleted = true;
                                address.DeletedBy = ESEIM.AppContext.UserName;
                                address.DeletedTime = DateTime.Now;
                                _context.WORKOSAddressCards.Update(address);

                                var activity = new CardUserActivity
                                {
                                    UserId = ESEIM.AppContext.UserId,
                                    IdObject = "ADDR",
                                    Action = "DELETE",
                                    IsCheck = true,
                                    CardCode = card.CardCode,
                                    CreatedTime = DateTime.Now,
                                    FromDevice = "Laptop/Desktop",
                                    ChangeDetails = address.LocationText
                                };
                                _context.CardUserActivitys.Add(activity);
                            }
                        }
                    }

                    //Update log activity accept, reject
                    var logs = _context.CardUserActivitys.Where(x => x.CardCode == card.CardCode && x.UserId == ESEIM.AppContext.UserId
                    && x.CreatedTime >= buffer.TimeSpanActivity.TimeStart && x.CreatedTime <= timeEnd && x.Action != "REVIEW"
                    ).OrderByDescending(x => x.CreatedTime).ToList();
                    if (logs.Any())
                    {
                        for (int i = 1; i < logs.Count(); i++)
                        {
                            _context.CardUserActivitys.Remove(logs[i]);
                        }
                    }
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_MSG_SUCCES_SAVE"];
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
        public JsonResult RollbackDataBuffer([FromBody] ItemWorkCheck dataBuffer)
        {
            var cardCode = "";
            if (dataBuffer.ItemCheck.Any())
            {
                cardCode = dataBuffer.ItemCheck[0].CardCode;
            }
            var msg = new JMessage();
            try
            {
                //Clear data item check
                var data = _context.CardItemChecks.Where(x => !x.Flag && x.CardCode == cardCode)
                  .Select(x => new
                  {
                      x.Id,
                      x.ChkListCode,
                      x.CheckTitle,
                      x.Completed,
                      x.WeightNum,
                      checkItem = false,
                      TitleSubItemChk = "",
                      ListUserItemChk = (from a in _context.WorkItemAssignStaffs
                                         join b in _context.Users on a.UserId equals b.Id
                                         where a.CheckListCode == x.ChkListCode && a.IsDeleted == false && (a.CheckItem == "")
                                         select new
                                         {
                                             a.ID,
                                         }),
                      ListSubItem = _context.CardSubitemChecks.Where(y => y.ChkListCode == x.ChkListCode && y.Flag == false).Select(y => new
                      {
                          y.Id,
                          y.Title,
                          y.Approve,
                          y.ApprovedTime,
                          y.Completed,
                          y.Approver,
                          y.WeightNum,
                          ListUserSubItem = (from a in _context.WorkItemAssignStaffs
                                             join b in _context.Users on a.UserId equals b.Id
                                             where a.CheckItem == y.Id.ToString() && a.IsDeleted == false
                                             select new
                                             {
                                                 a.ID,
                                             }),
                      }),
                  }).ToList();
                var list = (from a in _context.WORKItemSessions
                            join b in _context.ShiftLogs on a.ShiftCode equals b.ShiftCode
                            where !a.IsDeleted && a.CardCode.Equals(cardCode)
                            select new ViewItem
                            {
                                Id = a.Id,
                                WorkSession = a.WorkSession,
                                ItemWorkList = _context.SessionItemChkItems.Where(x => !x.IsDeleted && x.Session == a.WorkSession).ToList(),
                                Note = a.Note,
                                Status = a.Status,
                                Progress = a.Progress,
                                UserName = _context.Users.FirstOrDefault(x => x.UserName.Equals(a.CreatedBy)).GivenName,
                                CheckItem = false,
                                TimeCheckIn = b.ChkinTime.Value,
                                Value = "",
                                listItemActivity = (from c in _context.WORKItemSessionResults
                                                    join d in _context.SessionItemChkItems on c.WorkSession equals d.Session
                                                    join e in _context.CardItemChecks on d.Item equals e.ChkListCode
                                                    where c.WorkSession.Equals(a.WorkSession) && !c.IsDeleted
                                                    select new WorkSessionResultTemp
                                                    {
                                                        Id = c.Id,
                                                        StartTime = c.StartTime,
                                                        EndTime = c.EndTime,
                                                        ProgressFromLeader = c.ProgressFromLeader,
                                                        ProgressFromStaff = c.ProgressFromStaff,
                                                        CheckTitle = e.CheckTitle
                                                    }).DistinctBy(x => x.Id).ToList(),
                            }).ToList();
                foreach (var item in list)
                {
                    string value = "";
                    foreach (var i in item.ItemWorkList)
                    {
                        var CheckTitle = _context.CardItemChecks.FirstOrDefault(x => !x.Flag && x.ChkListCode == i.Item);
                        if (CheckTitle != null)
                        {
                            value += CheckTitle.CheckTitle + ", ";
                        }
                    }
                    item.Value = value;
                }
                if (data.Any())
                {
                    foreach (var item in data)
                    {
                        if (item.ListUserItemChk.Any())
                        {
                            foreach (var user in item.ListUserItemChk)
                            {
                                var staff = _context.WorkItemAssignStaffs.FirstOrDefault(x => x.ID == user.ID);
                                if (staff != null)
                                    _context.WorkItemAssignStaffs.Remove(staff);
                            }
                        }
                        if (item.ListSubItem.Any())
                        {
                            foreach (var subItem in item.ListSubItem)
                            {
                                if (subItem.ListUserSubItem != null && subItem.ListUserSubItem.Any())
                                {
                                    foreach (var id in subItem.ListUserSubItem)
                                    {
                                        var staff = _context.WorkItemAssignStaffs.FirstOrDefault(x => x.ID == id.ID);
                                        if (staff != null)
                                            _context.WorkItemAssignStaffs.Remove(staff);
                                    }

                                }
                            }
                            var subs = _context.CardSubitemChecks.Where(y => y.ChkListCode == item.ChkListCode && y.Flag == false);
                            foreach (var sub in subs)
                            {
                                sub.Flag = true;
                            }
                            _context.CardSubitemChecks.UpdateRange(subs);
                        }
                    }
                    var itemChecks = _context.CardItemChecks.Where(x => x.CardCode == cardCode && !x.Flag);
                    _context.CardItemChecks.RemoveRange(itemChecks);
                }
                //Roll back item work
                if (dataBuffer.ItemCheck.Any())
                {
                    foreach (var item in dataBuffer.ItemCheck)
                    {
                        var itemCheck = new CardItemCheck()
                        {
                            CardCode = cardCode,
                            CheckTitle = item.CheckTitle,
                            WeightNum = item.WeightNum,
                            ChkListCode = item.ChkListCode,
                            CreatedBy = item.CreatedBy,
                            CreatedTime = item.CreatedTime,
                            Completed = item.Completed
                        };
                        _context.CardItemChecks.Add(itemCheck);

                        if (item.ListUserItemChk.Any())
                        {
                            foreach (var itemU in item.ListUserItemChk)
                            {
                                var jobCardUser = new WorkItemAssignStaff
                                {
                                    CardCode = cardCode,
                                    UserId = itemU.UserId,
                                    CheckItem = "",
                                    CheckListCode = item.ChkListCode,
                                    CreatedBy = itemU.CreatedBy,
                                    CreatedTime = itemU.CreatedTime,
                                    EstimateTime = itemU.EstimateTime.ToString(),
                                    Unit = itemU.Unit
                                };
                                _context.WorkItemAssignStaffs.Add(jobCardUser);
                            }
                        }
                        if (item.ListSubItem.Any())
                        {
                            foreach (var sI in item.ListSubItem)
                            {
                                var subItem = new CardSubitemCheck()
                                {
                                    ChkListCode = item.ChkListCode,
                                    Title = sI.Title,
                                    Approver = sI.Approver,
                                    Approve = sI.Approve,
                                    ApprovedTime = sI.ApprovedTime,
                                    Completed = sI.Completed,
                                    WeightNum = sI.WeightNum,
                                };
                                _context.CardSubitemChecks.Add(subItem);

                                var lastSub = _context.CardSubitemChecks.MaxBy(x => x.Id);
                                var id = lastSub != null ? lastSub.Id : 0;
                                if (sI.ListUserSubItem != null)
                                {
                                    foreach (var itemU in sI.ListUserSubItem)
                                    {
                                        id++;
                                        var jobCardUser = new WorkItemAssignStaff
                                        {
                                            CardCode = cardCode,
                                            UserId = itemU.UserId,
                                            CheckItem = id.ToString(),
                                            CheckListCode = item.ChkListCode,
                                            CreatedBy = itemU.CreatedBy,
                                            CreatedTime = itemU.CreatedTime,
                                            EstimateTime = itemU.EstimateTime.ToString(),
                                            Unit = itemU.Unit
                                        };
                                        _context.WorkItemAssignStaffs.Add(jobCardUser);
                                    }
                                }
                            }
                        }
                    }
                }
                //Roll back Completed
                var workOSCard = _context.WORKOSCards.SingleOrDefault(x => !x.IsDeleted && x.CardCode.Equals(cardCode));
                if (workOSCard != null)
                {
                    workOSCard.Completed = dataBuffer.CompleteOld + 0.00M;
                }

                //Update log activity accept, reject
                var timeEnd = DateTime.Now;
                var logs = _context.CardUserActivitys.Where(x => x.CardCode == cardCode && x.UserId == ESEIM.AppContext.UserId
                && x.CreatedTime >= dataBuffer.TimeSpanActivity.TimeStart && x.CreatedTime <= timeEnd && x.Action != "REVIEW"
                ).OrderByDescending(x => x.CreatedTime).ToList();
                if (logs.Any())
                {
                    for (int i = 1; i < logs.Count(); i++)
                    {
                        _context.CardUserActivitys.Remove(logs[i]);
                    }
                }

                _context.SaveChanges();

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [NonAction]
        public void ChangeInheritInBuffer(WORKOSCard data, string inherit)
        {
            var oldInherit = _context.WORKOSCards.FirstOrDefault(x => x.CardCode == data.Inherit);
            if (string.IsNullOrEmpty(data.Inherit) || oldInherit.IsDeleted)
            {
                //log content
                var activity = new CardUserActivity
                {
                    UserId = ESEIM.AppContext.UserId,
                    Action = "UPDATE",
                    IdObject = "ITEMWORK",
                    IsCheck = true,
                    CardCode = data.CardCode,
                    CreatedTime = DateTime.Now,
                    FromDevice = "Laptop/Desktop",
                    ChangeDetails = "Chọn việc kế thừa " + (_context.WORKOSCards.FirstOrDefault(x => x.CardCode == inherit && !x.IsDeleted) != null ? _context.WORKOSCards.FirstOrDefault(x => x.CardCode == inherit && !x.IsDeleted).CardName : "")
                };
                _context.CardUserActivitys.Add(activity);
            }
            else
            {
                //log content
                var activity = new CardUserActivity
                {
                    UserId = ESEIM.AppContext.UserId,
                    Action = "UPDATE",
                    IdObject = "ITEMWORK",
                    IsCheck = true,
                    CardCode = data.CardCode,
                    CreatedTime = DateTime.Now,
                    FromDevice = "Laptop/Desktop",
                    ChangeDetails = "Việc kế thừa từ " + (_context.WORKOSCards.FirstOrDefault(x => x.CardCode == data.CardCode && !x.IsDeleted) != null ? _context.WORKOSCards.FirstOrDefault(x => x.CardCode == data.Inherit && !x.IsDeleted).CardName : "")
                    + " sang " + (_context.WORKOSCards.FirstOrDefault(x => x.CardCode == inherit && !x.IsDeleted) != null ? _context.WORKOSCards.FirstOrDefault(x => x.CardCode == inherit && !x.IsDeleted).CardName : "")
                };
                _context.CardUserActivitys.Add(activity);
            }
            data.Inherit = inherit;
            var cardInherit = _context.WORKOSCards.FirstOrDefault(x => x.CardCode == inherit && !x.IsDeleted);
            var listAttach = _context.CardAttachments.Where(x => x.CardCode == cardInherit.CardCode);
            var listRela = _context.JcObjectIdRelatives.Where(x => !x.IsDeleted && x.CardCode == cardInherit.CardCode);
            if (listAttach.Count() > 0)
            {
                foreach (var item in listAttach)
                {
                    var attach = new CardAttachment
                    {
                        CardCode = data.CardCode,
                        FileCode = "ATTACHMENT" + DateTime.Now.ToString("ddMMyyyyHHmmss"),
                        MemberId = ESEIM.AppContext.UserName,
                        FileName = item.FileName,
                        FileUrl = item.FileUrl,
                        CreatedTime = DateTime.Now,
                    };
                    _context.CardAttachments.Add(attach);
                }
            }

            if (listRela.Count() > 0)
            {
                foreach (var item in listRela)
                {
                    var rela = new JcObjectIdRelative
                    {
                        CardCode = data.CardCode,
                        ObjTypeCode = item.ObjTypeCode,
                        ObjID = item.ObjID,
                        Relative = item.Relative,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now,
                        Weight = item.Weight.HasValue ? item.Weight.Value : 0
                    };
                    _context.JcObjectIdRelatives.Add(rela);
                }
            }
        }
        [HttpGet]
        public async Task<JsonResult> GetAddress(string lat, string lon)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var result = await _googleAPI.GetAddress(lat, lon);
                if (result.status == "OK")
                {
                    msg.Object = result.results[0].formatted_address;
                }
                else
                {
                    msg.Error = true;
                    // msg.Title = "Key đã vượt mức giới hạn, vui lòng liên hệ administrator!";
                    msg.Title = _stringLocalizer["CJ_MSG_KEY_EXPIRED_PLS_CONTACT_ADMIN"];
                    return Json(msg);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi khi lấy địa chỉ!";
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetCardInList(string listCode)
        {
            var data = _context.WORKOSCards.Where(x => !x.IsDeleted && x.ListCode == listCode);
            return Json(data);
        }

        public class PramSuggest
        {
            public string objectCode { get; set; }
            public string boardCode { get; set; }
            public string ListCode { get; set; }
        }
        public class BufferData
        {
            public CardBuffer CardJob { get; set; }
            public JcRelaCard JcRelative { get; set; }
            public CardLinkBuffer CardLink { get; set; }
            //public CardGroupOrMemberModel Assign { get; set; }
            public ProductBuffer ProductBuffer { get; set; }
            public ServiceBuffer ServiceBuffer { get; set; }
            public AddressBuffer AddressBuffer { get; set; }
            public TimeSpanActivity TimeSpanActivity { get; set; }
        }
        public class CardBuffer
        {
            public string CardCode { get; set; }
            public string CardName { get; set; }
            public string Description { get; set; }
            public string WorkType { get; set; }
            public string Status { get; set; }
            public string CardLevel { get; set; }
            public string Deadline { get; set; }
            public string BeginTime { get; set; }
            public string EndTime { get; set; }
            public string WeightNum { get; set; }
            public decimal Completed { get; set; }
            public string Inherit { get; set; }
            public string ListCode { get; set; }

        }
        public class JcRelaCard
        {
            public List<string> ListDelRelative { get; set; }
            public List<ObjectRela> ListRelative { get; set; }
        }
        public class CardLinkBuffer
        {
            public List<int> ListCardLinkDel { get; set; }
            public List<CardLinkBufferData> ListCardLink { get; set; }
        }
        public class ObjectRela
        {
            public int ID { get; set; }
            public string ObjName { get; set; }
            public string ObjTypeName { get; set; }
            public string ObjTypeCode { get; set; }
            public string ObjID { get; set; }
            public string RelativeCode { get; set; }
            public string RelativeName { get; set; }
            public string Weight { get; set; }
            public string IdObjTemp { get; set; }
        }
        public class CardLinkBufferData
        {
            public int Id { get; set; }
            public string Code { get; set; }
            public string Name { get; set; }
            public string Status { get; set; }
            public string EndDate { get; set; }
        }
        public class ProductBuffer
        {
            public List<int> ListDelProduct { get; set; }
            public List<ProductBufferData> ListProduct { get; set; }
        }
        public class ServiceBuffer
        {
            public List<int> ListDelService { get; set; }
            public List<ServiceBufferData> ListService { get; set; }
        }
        public class AddressBuffer
        {
            public List<int> ListDelAddress { get; set; }
            public List<AddressBufferData> ListAddress { get; set; }
        }
        public class ProductBufferData
        {
            public int ID { get; set; }
            public int Quantity { get; set; }
            public DateTime CreatedTime { get; set; }
            public string CreatedBy { get; set; }
            public string ProductCode { get; set; }
            public string ProductName { get; set; }
            public string JcAct { get; set; }
        }
        public class ServiceBufferData
        {
            public int ID { get; set; }
            public int Quantity { get; set; }
            public DateTime CreatedTime { get; set; }
            public string CreatedBy { get; set; }
            public string ServiceCode { get; set; }
            public string ServiceName { get; set; }
            public string JcAct { get; set; }
        }
        public class AddressBufferData
        {
            public int Id { get; set; }
            public string LocationGps { get; set; }
            public string LocationText { get; set; }
            public string CreatedBy { get; set; }
            public DateTime CreatedTime { get; set; }
        }
        public class ItemWorkCheck
        {
            public List<CheckListItemBuffer> ItemCheck { get; set; }
            public List<ViewItem> ItemWork { get; set; }
            public decimal CompleteOld { get; set; }
            public TimeSpanActivity TimeSpanActivity { get; set; }
        }
        public class CheckListItemBuffer
        {
            public int Id { get; set; }
            public string CardCode { get; set; }
            public string ChkListCode { get; set; }
            public string CheckTitle { get; set; }
            public decimal WeightNum { get; set; }
            public decimal Completed { get; set; }
            public string CreatedBy { get; set; }
            public DateTime CreatedTime { get; set; }
            public bool CheckItem { get; set; }
            public string TitleSubItemChk { get; set; }
            public List<UserAssignBufeer> ListUserItemChk { get; set; }
            public List<SubItemBuffer> ListSubItem { get; set; }
        }
        public class SubItemBuffer
        {
            public int Id { get; set; }
            public string Title { get; set; }
            public decimal WeightNum { get; set; }
            public decimal Completed { get; set; }
            public bool Approve { get; set; }
            public List<UserAssignBufeer> ListUserSubItem { get; set; }
            public string Approver { get; set; }
            public DateTime? ApprovedTime { get; set; }
        }
        public class UserAssignBufeer
        {
            public int ID { get; set; }
            public string UserId { get; set; }
            public string GivenName { get; set; }
            public decimal EstimateTime { get; set; }
            public string Status { get; set; }
            public string Unit { get; set; }
            public string CreatedBy { get; set; }
            public DateTime CreatedTime { get; set; }
        }
        public class CommentBuffer
        {
            public List<int> ListDelComment { get; set; }
            public List<CommentBufferData> ListComment { get; set; }
        }
        public class CommentBufferData
        {
            public int Id { get; set; }
            public string Picture { get; set; }
            public string MemberId { get; set; }
            public string CmtContent { get; set; }
            public DateTime? CreatedTime { get; set; }
            public DateTime? UpdatedTime { get; set; }
            public string UpdatedBy { get; set; }
        }
        public class TimeSpanActivity
        {
            public DateTime? TimeStart { get; set; }
        }

        [HttpPost]
        public object GetSuggesstion([FromBody] PramSuggest prams)
        {
            var userName = ESEIM.AppContext.UserName;
            var user = _context.Users.FirstOrDefault(x => x.Active && x.UserName == userName);
            if (!string.IsNullOrEmpty(prams.boardCode))
            {
                var listCode = _context.WORKOSLists.FirstOrDefault(x => x.BoardCode == prams.boardCode && !x.IsDeleted);
                if (prams.objectCode == "")
                {
                    var max = _context.WORKOSCards.Where(x => x.ListCode == listCode.ListCode && !x.IsDeleted && x.CreatedBy == userName);
                    if (max.Count() > 0)
                    {
                        var maxId = max.Max(x => x.CardID);
                        var lastCard = _context.WORKOSCards.FirstOrDefault(x => x.CardID == maxId);

                        var listRela = _context.JcObjectIdRelatives.Where(x => !x.IsDeleted && x.CardCode == lastCard.CardCode);
                        var assign = _context.CardMappings.Where(x => x.CardCode == lastCard.CardCode).DistinctBy(p => new { p.BoardCode, p.CardCode, p.UserId, p.GroupUserCode, p.Responsibility }).ToList();
                        var listGroup = assign.Where(x => x.TeamCode != null);
                        var listDepart = assign.Where(x => x.GroupUserCode != null);
                        var listMember = assign.Where(x => x.UserId != null);
                        var listAttach = _context.CardAttachments.Where(x => x.CardCode == lastCard.CardCode);
                        //Insert card and attr
                        var card = new WORKOSCard
                        {
                            CardName = "",
                            CardCode = "" + (_context.WORKOSCards.Count() > 0 ? _context.WORKOSCards.Max(x => x.CardID) + 1 : 1),
                            ListCode = listCode.ListCode,
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedDate = DateTime.Now,
                            Currency = "CURRENCY_VND",
                            Status = "CREATED",
                            BeginTime = DateTime.Now,
                            Deadline = DateTime.Now
                        };
                        _context.WORKOSCards.Add(card);
                        var comment = new CardCommentList()
                        {
                            CardCode = card.CardCode,
                            CmtId = "Comment" + Guid.NewGuid().ToString(),
                            CmtContent = "Đã tạo công việc",
                            MemberId = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now
                        };
                        _context.CardCommentLists.Add(comment);

                        //Add department of member create card
                        var cardDefaultDepartment = new CardMapping
                        {
                            BoardCode = prams.boardCode,
                            ListCode = listCode.ListCode,
                            CardCode = card.CardCode,
                            GroupUserCode = user.DepartmentId,
                            CreatedBy = userName,
                            CreatedTime = DateTime.Now,
                            Responsibility = "ROLE_STAFF"
                        };
                        _context.CardMappings.Add(cardDefaultDepartment);

                        if (listGroup.Count() > 0)
                        {
                            foreach (var item in listGroup)
                            {
                                var cardMapping = new CardMapping
                                {
                                    BoardCode = prams.boardCode,
                                    ListCode = listCode.ListCode,
                                    CardCode = card.CardCode,
                                    TeamCode = item.TeamCode,
                                    CreatedBy = userName,
                                    CreatedTime = DateTime.Now,
                                    Responsibility = item.Responsibility != null ? item.Responsibility : null
                                };
                                _context.CardMappings.Add(cardMapping);

                            }

                        }
                        if (listMember.Count() > 0)
                        {
                            foreach (var item in listMember)
                            {
                                if (item.UserId != ESEIM.AppContext.UserId)
                                {
                                    card.LstUser += item.UserId + ",";
                                    var cardMapping = new CardMapping
                                    {
                                        BoardCode = prams.boardCode,
                                        ListCode = listCode.ListCode,
                                        CardCode = card.CardCode,
                                        UserId = item.UserId,
                                        CreatedBy = userName,
                                        CreatedTime = DateTime.Now,
                                        Responsibility = item.Responsibility != null ? item.Responsibility : null
                                    };
                                    _context.CardMappings.Add(cardMapping);
                                }
                            }
                        }
                        var addLeader = new CardMapping
                        {
                            BoardCode = prams.boardCode,
                            ListCode = listCode.ListCode,
                            CardCode = card.CardCode,
                            UserId = ESEIM.AppContext.UserId,
                            CreatedBy = userName,
                            CreatedTime = DateTime.Now,
                            Responsibility = "ROLE_LEADER"
                        };
                        card.LstUser += ESEIM.AppContext.UserId + ",";
                        _context.CardMappings.Add(addLeader);
                        if (listDepart.Count() > 0)
                        {
                            foreach (var item in listDepart)
                            {
                                var lstMemberInDepartment = _context.Users.Where(x => x.Active && x.DepartmentId == item.GroupUserCode);
                                foreach (var member in lstMemberInDepartment)
                                {
                                    card.LstUser += member.Id + ",";
                                }

                                if (item.GroupUserCode != cardDefaultDepartment.GroupUserCode)
                                {
                                    var cardMappingDepartment = new CardMapping
                                    {
                                        BoardCode = prams.boardCode,
                                        ListCode = listCode.ListCode,
                                        CardCode = card.CardCode,
                                        GroupUserCode = item.GroupUserCode,
                                        CreatedBy = userName,
                                        CreatedTime = DateTime.Now,
                                        Responsibility = item.Responsibility != null ? item.Responsibility : null
                                    };
                                    _context.CardMappings.Add(cardMappingDepartment);
                                }
                            }
                        }
                        if (listRela.Count() > 0)
                        {
                            foreach (var item in listRela)
                            {
                                var rela = new JcObjectIdRelative
                                {
                                    CardCode = card.CardCode,
                                    ObjTypeCode = item.ObjTypeCode,
                                    ObjID = item.ObjID,
                                    Relative = item.Relative,
                                    CreatedBy = userName,
                                    CreatedTime = DateTime.Now,
                                    Weight = item.Weight.HasValue ? item.Weight.Value : 0
                                };
                                _context.JcObjectIdRelatives.Add(rela);
                            }
                        }
                        if (listAttach.Count() > 0)
                        {
                            foreach (var item in listAttach)
                            {
                                var attach = new CardAttachment
                                {
                                    CardCode = card.CardCode,
                                    FileCode = "ATTACHMENT" + DateTime.Now.ToString("ddMMyyyyHHmmss"),
                                    MemberId = userName,
                                    FileName = item.FileName,
                                    FileUrl = item.FileUrl,
                                    CreatedTime = DateTime.Now,
                                    ListPermissionViewFile = item.ListPermissionViewFile
                                };
                                _context.CardAttachments.Add(attach);
                            }

                        }
                        _context.SaveChanges();
                        return new
                        {
                            BoardCode = prams.boardCode,
                            Card = card,
                            ListCode = listCode.ListCode,
                        };
                    }
                    else
                    {
                        var card = new WORKOSCard
                        {
                            CardName = "",
                            CardCode = "" + (_context.WORKOSCards.Count() > 0 ? _context.WORKOSCards.Max(x => x.CardID) + 1 : 1),
                            ListCode = listCode.ListCode,
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedDate = DateTime.Now,
                            Currency = "CURRENCY_VND",
                            Status = "CREATED",
                            BeginTime = DateTime.Now,
                            Deadline = DateTime.Now
                        };
                        _context.WORKOSCards.Add(card);
                        var comment = new CardCommentList()
                        {
                            CardCode = card.CardCode,
                            CmtId = "Comment" + Guid.NewGuid().ToString(),
                            CmtContent = "Đã tạo công việc",
                            MemberId = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now
                        };
                        _context.CardCommentLists.Add(comment);

                        var addLeader = new CardMapping
                        {
                            BoardCode = prams.boardCode,
                            ListCode = listCode.ListCode,
                            CardCode = card.CardCode,
                            UserId = ESEIM.AppContext.UserId,
                            CreatedBy = userName,
                            CreatedTime = DateTime.Now,
                            Responsibility = "ROLE_LEADER"
                        };
                        _context.CardMappings.Add(addLeader);
                        card.LstUser += ESEIM.AppContext.UserId + ",";

                        //Add department of member create card
                        var cardMapping = new CardMapping
                        {
                            BoardCode = prams.boardCode,
                            ListCode = listCode.ListCode,
                            CardCode = card.CardCode,
                            GroupUserCode = user.DepartmentId,
                            CreatedBy = userName,
                            CreatedTime = DateTime.Now,
                            Responsibility = "ROLE_MAIN"
                        };
                        _context.CardMappings.Add(cardMapping);

                        _context.SaveChanges();
                        return new
                        {
                            BoardCode = prams.boardCode,
                            Card = card,
                            ListCode = listCode.ListCode,
                        };
                    }
                }
                else
                {
                    var max = (from a in _context.WORKOSCards
                               join b in _context.JcObjectIdRelatives on a.CardCode equals b.CardCode
                               where !a.IsDeleted && !b.IsDeleted && b.ObjID == prams.objectCode && a.CreatedBy == userName && a.ListCode == listCode.ListCode
                               select a);
                    if (max.Count() > 0)
                    {
                        var maxId = max.Max(x => x.CardID);
                        var lastCard = _context.WORKOSCards.FirstOrDefault(x => x.CardID == maxId);

                        var listRela = _context.JcObjectIdRelatives.Where(x => !x.IsDeleted && x.CardCode == lastCard.CardCode);
                        var assign = _context.CardMappings.Where(x => x.CardCode == lastCard.CardCode);
                        var listGroup = assign.Where(x => x.TeamCode != null);
                        var listDepart = assign.Where(x => x.GroupUserCode != null);
                        var listMember = assign.Where(x => x.UserId != null);
                        var listAttach = _context.CardAttachments.Where(x => x.CardCode == lastCard.CardCode);
                        //Insert card and attr
                        var card = new WORKOSCard
                        {
                            CardName = "",
                            CardCode = "" + (_context.WORKOSCards.Count() > 0 ? _context.WORKOSCards.Max(x => x.CardID) + 1 : 1),
                            ListCode = listCode.ListCode,
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedDate = DateTime.Now,
                            Currency = "CURRENCY_VND",
                            Status = "CREATED",
                            BeginTime = DateTime.Now,
                            Deadline = DateTime.Now
                        };
                        _context.WORKOSCards.Add(card);
                        var comment = new CardCommentList()
                        {
                            CardCode = card.CardCode,
                            CmtId = "Comment" + Guid.NewGuid().ToString(),
                            CmtContent = "Đã tạo công việc",
                            MemberId = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now
                        };
                        _context.CardCommentLists.Add(comment);

                        //Add department of member create card
                        var cardDefaultDepartment = new CardMapping
                        {
                            BoardCode = prams.boardCode,
                            ListCode = listCode.ListCode,
                            CardCode = card.CardCode,
                            GroupUserCode = user.DepartmentId,
                            CreatedBy = userName,
                            CreatedTime = DateTime.Now,
                            Responsibility = "ROLE_STAFF"
                        };
                        _context.CardMappings.Add(cardDefaultDepartment);
                        if (listGroup.Count() > 0)
                        {
                            foreach (var item in listGroup)
                            {
                                var cardMapping = new CardMapping
                                {
                                    BoardCode = prams.boardCode,
                                    ListCode = listCode.ListCode,
                                    CardCode = card.CardCode,
                                    TeamCode = item.TeamCode,
                                    CreatedBy = userName,
                                    CreatedTime = DateTime.Now,
                                    Responsibility = item.Responsibility != null ? item.Responsibility : null
                                };
                                _context.CardMappings.Add(cardMapping);

                            }
                        }
                        if (listMember.Count() > 0)
                        {
                            foreach (var item in listMember)
                            {
                                if (item.UserId != ESEIM.AppContext.UserId)
                                {
                                    card.LstUser += item.UserId + ",";
                                    var cardMapping = new CardMapping
                                    {
                                        BoardCode = prams.boardCode,
                                        ListCode = listCode.ListCode,
                                        CardCode = card.CardCode,
                                        UserId = item.UserId,
                                        CreatedBy = userName,
                                        CreatedTime = DateTime.Now,
                                        Responsibility = item.Responsibility != null ? item.Responsibility : null
                                    };
                                    _context.CardMappings.Add(cardMapping);
                                }
                            }
                        }
                        if (listDepart.Count() > 0)
                        {
                            foreach (var item in listDepart)
                            {
                                var lstMemberInDepartment = _context.Users.Where(x => x.Active && x.DepartmentId == item.GroupUserCode);
                                foreach (var member in lstMemberInDepartment)
                                {
                                    card.LstUser += member.Id + ",";
                                }
                                if (item.GroupUserCode != cardDefaultDepartment.GroupUserCode)
                                {
                                    var cardMapping = new CardMapping
                                    {
                                        BoardCode = prams.boardCode,
                                        ListCode = listCode.ListCode,
                                        CardCode = card.CardCode,
                                        GroupUserCode = item.GroupUserCode,
                                        CreatedBy = userName,
                                        CreatedTime = DateTime.Now,
                                        Responsibility = item.Responsibility != null ? item.Responsibility : null
                                    };
                                    _context.CardMappings.Add(cardMapping);
                                }

                            }
                        }
                        if (listRela.Count() > 0)
                        {
                            foreach (var item in listRela)
                            {
                                var rela = new JcObjectIdRelative
                                {
                                    CardCode = card.CardCode,
                                    ObjTypeCode = item.ObjTypeCode,
                                    ObjID = item.ObjID,
                                    Relative = item.Relative,
                                    CreatedBy = userName,
                                    CreatedTime = DateTime.Now,
                                    Weight = item.Weight.HasValue ? item.Weight.Value : 0
                                };
                                _context.JcObjectIdRelatives.Add(rela);
                            }
                        }
                        if (listAttach.Count() > 0)
                        {
                            foreach (var item in listAttach)
                            {
                                var attach = new CardAttachment
                                {
                                    CardCode = card.CardCode,
                                    FileCode = "ATTACHMENT" + DateTime.Now.ToString("ddMMyyyyHHmmss"),
                                    MemberId = userName,
                                    FileName = item.FileName,
                                    FileUrl = item.FileUrl,
                                    CreatedTime = DateTime.Now,
                                    ListPermissionViewFile = item.ListPermissionViewFile
                                };
                                _context.CardAttachments.Add(attach);
                            }

                        }
                        var addLeader = new CardMapping
                        {
                            BoardCode = prams.boardCode,
                            ListCode = listCode.ListCode,
                            CardCode = card.CardCode,
                            UserId = ESEIM.AppContext.UserId,
                            CreatedBy = userName,
                            CreatedTime = DateTime.Now,
                            Responsibility = "ROLE_LEADER"
                        };
                        card.LstUser += ESEIM.AppContext.UserId + ",";
                        _context.CardMappings.Add(addLeader);
                        _context.SaveChanges();
                        return new
                        {
                            BoardCode = prams.boardCode,
                            Card = card,
                            ListCode = listCode.ListCode,
                        };
                    }
                    else
                    {
                        var card = new WORKOSCard
                        {
                            CardName = "",
                            CardCode = "" + (_context.WORKOSCards.Count() > 0 ? _context.WORKOSCards.Max(x => x.CardID) + 1 : 1),
                            ListCode = listCode.ListCode,
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedDate = DateTime.Now,
                            Currency = "CURRENCY_VND",
                            Status = "CREATED",
                            BeginTime = DateTime.Now,
                            Deadline = DateTime.Now
                        };
                        _context.WORKOSCards.Add(card);
                        var comment = new CardCommentList()
                        {
                            CardCode = card.CardCode,
                            CmtId = "Comment" + Guid.NewGuid().ToString(),
                            CmtContent = "Đã tạo công việc",
                            MemberId = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now
                        };
                        _context.CardCommentLists.Add(comment);
                        var addLeader = new CardMapping
                        {
                            BoardCode = prams.boardCode,
                            ListCode = listCode.ListCode,
                            CardCode = card.CardCode,
                            UserId = ESEIM.AppContext.UserId,
                            CreatedBy = userName,
                            CreatedTime = DateTime.Now,
                            Responsibility = "ROLE_LEADER"
                        };
                        _context.CardMappings.Add(addLeader);
                        card.LstUser += ESEIM.AppContext.UserId + ",";
                        //Add department of member create card
                        var cardDefaultDepartment = new CardMapping
                        {
                            BoardCode = prams.boardCode,
                            ListCode = listCode.ListCode,
                            CardCode = card.CardCode,
                            GroupUserCode = user.DepartmentId,
                            CreatedBy = userName,
                            CreatedTime = DateTime.Now,
                            Responsibility = "ROLE_STAFF"
                        };
                        _context.CardMappings.Add(cardDefaultDepartment);

                        _context.SaveChanges();
                        return new
                        {
                            BoardCode = prams.boardCode,
                            Card = card,
                            ListCode = listCode.ListCode,
                        };
                    }
                }
            }
            else
            {
                if (prams.objectCode == "")
                {
                    var max = _context.WORKOSCards.Where(x => x.IsDeleted == false && x.CreatedBy == userName);
                    if (max.Count() > 0)
                    {
                        var maxId = max.Max(x => x.CardID);
                        var lastCard = _context.WORKOSCards.FirstOrDefault(x => x.CardID == maxId);

                        var listCode = _context.WORKOSLists.FirstOrDefault(x => x.ListCode == lastCard.ListCode && !x.IsDeleted);
                        var board = _context.WORKOSBoards.FirstOrDefault(x => x.BoardCode == listCode.BoardCode && !x.IsDeleted);
                        var listRela = _context.JcObjectIdRelatives.Where(x => !x.IsDeleted && x.CardCode == lastCard.CardCode);
                        var assign = _context.CardMappings.Where(x => x.CardCode == lastCard.CardCode);
                        var listGroup = assign.Where(x => x.TeamCode != null);
                        var listDepart = assign.Where(x => x.GroupUserCode != null);
                        var listMember = assign.Where(x => x.UserId != null);
                        var listAttach = _context.CardAttachments.Where(x => x.CardCode == lastCard.CardCode);
                        //Insert card and attr
                        var card = new WORKOSCard
                        {
                            CardName = "",
                            CardCode = "" + (_context.WORKOSCards.Count() > 0 ? _context.WORKOSCards.Max(x => x.CardID) + 1 : 1),
                            ListCode = listCode.ListCode,
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedDate = DateTime.Now,
                            Currency = "CURRENCY_VND",
                            Status = "CREATED",
                            BeginTime = DateTime.Now,
                            Deadline = DateTime.Now
                        };
                        _context.WORKOSCards.Add(card);
                        var comment = new CardCommentList()
                        {
                            CardCode = card.CardCode,
                            CmtId = "Comment" + Guid.NewGuid().ToString(),
                            CmtContent = "Đã tạo công việc",
                            MemberId = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now
                        };
                        _context.CardCommentLists.Add(comment);
                        var addLeader = new CardMapping
                        {
                            BoardCode = board.BoardCode,
                            ListCode = listCode.ListCode,
                            CardCode = card.CardCode,
                            UserId = ESEIM.AppContext.UserId,
                            CreatedBy = userName,
                            CreatedTime = DateTime.Now,
                            Responsibility = "ROLE_LEADER"
                        };
                        _context.CardMappings.Add(addLeader);
                        card.LstUser += ESEIM.AppContext.UserId + ",";
                        //Add department of member create card
                        var cardDefaultDepartment = new CardMapping
                        {
                            BoardCode = board.BoardCode,
                            ListCode = listCode.ListCode,
                            CardCode = card.CardCode,
                            GroupUserCode = user.DepartmentId,
                            CreatedBy = userName,
                            CreatedTime = DateTime.Now,
                            Responsibility = "ROLE_STAFF"
                        };
                        _context.CardMappings.Add(cardDefaultDepartment);

                        if (listGroup.Count() > 0)
                        {
                            foreach (var item in listGroup)
                            {
                                var cardMapping = new CardMapping
                                {
                                    BoardCode = board.BoardCode,
                                    ListCode = listCode.ListCode,
                                    CardCode = card.CardCode,
                                    TeamCode = item.TeamCode,
                                    CreatedBy = userName,
                                    CreatedTime = DateTime.Now,
                                    Responsibility = item.Responsibility != null ? item.Responsibility : null
                                };
                                _context.CardMappings.Add(cardMapping);

                            }
                        }
                        if (listMember.Count() > 0)
                        {
                            foreach (var item in listMember)
                            {
                                card.LstUser += item.UserId + ",";
                                if (item.UserId != ESEIM.AppContext.UserId)
                                {
                                    var cardMapping = new CardMapping
                                    {
                                        BoardCode = board.BoardCode,
                                        ListCode = listCode.ListCode,
                                        CardCode = card.CardCode,
                                        UserId = item.UserId,
                                        CreatedBy = userName,
                                        CreatedTime = DateTime.Now,
                                        Responsibility = item.Responsibility != null ? item.Responsibility : null
                                    };
                                    _context.CardMappings.Add(cardMapping);
                                }
                            }
                        }
                        if (listDepart.Count() > 0)
                        {
                            foreach (var item in listDepart)
                            {
                                var lstMemberInDepartment = _context.Users.Where(x => x.Active && x.DepartmentId == item.GroupUserCode);
                                foreach (var member in lstMemberInDepartment)
                                {
                                    card.LstUser += member.Id + ",";
                                }
                                if (item.GroupUserCode != cardDefaultDepartment.GroupUserCode)
                                {
                                    var cardMapping = new CardMapping
                                    {
                                        BoardCode = board.BoardCode,
                                        ListCode = listCode.ListCode,
                                        CardCode = card.CardCode,
                                        GroupUserCode = item.GroupUserCode,
                                        CreatedBy = userName,
                                        CreatedTime = DateTime.Now,
                                        Responsibility = item.Responsibility != null ? item.Responsibility : null
                                    };
                                    _context.CardMappings.Add(cardMapping);
                                }
                            }
                        }
                        if (listRela.Count() > 0)
                        {
                            foreach (var item in listRela)
                            {
                                var rela = new JcObjectIdRelative
                                {
                                    CardCode = card.CardCode,
                                    ObjTypeCode = item.ObjTypeCode,
                                    ObjID = item.ObjID,
                                    Relative = item.Relative,
                                    CreatedBy = userName,
                                    CreatedTime = DateTime.Now,
                                    Weight = item.Weight.HasValue ? item.Weight.Value : 0
                                };
                                _context.JcObjectIdRelatives.Add(rela);
                            }
                        }
                        if (listAttach.Count() > 0)
                        {
                            foreach (var item in listAttach)
                            {
                                var attach = new CardAttachment
                                {
                                    CardCode = card.CardCode,
                                    FileCode = "ATTACHMENT" + DateTime.Now.ToString("ddMMyyyyHHmmss"),
                                    MemberId = userName,
                                    FileName = item.FileName,
                                    FileUrl = item.FileUrl,
                                    CreatedTime = DateTime.Now,
                                    ListPermissionViewFile = item.ListPermissionViewFile
                                };
                                _context.CardAttachments.Add(attach);
                            }

                        }
                        _context.SaveChanges();
                        return new
                        {
                            BoardCode = board.BoardCode,
                            Card = card,
                            ListCode = listCode.ListCode,
                        };
                    }
                    else
                    {
                        var boards = _context.WORKOSBoards.Where(x => !x.IsDeleted);
                        if (boards.Any())
                        {
                            var board = boards.FirstOrDefault();
                            var list = _context.WORKOSLists.FirstOrDefault(x => x.BoardCode == board.BoardCode && !x.IsDeleted);
                            var card = new WORKOSCard
                            {
                                CardName = "",
                                CardCode = "" + (_context.WORKOSCards.Count() > 0 ? _context.WORKOSCards.Max(x => x.CardID) + 1 : 1),
                                ListCode = list.ListCode,
                                CreatedBy = ESEIM.AppContext.UserName,
                                CreatedDate = DateTime.Now,
                                Currency = "CURRENCY_VND",
                                Status = "CREATED",
                                BeginTime = DateTime.Now,
                                Deadline = DateTime.Now
                            };
                            _context.WORKOSCards.Add(card);
                            var comment = new CardCommentList()
                            {
                                CardCode = card.CardCode,
                                CmtId = "Comment" + Guid.NewGuid().ToString(),
                                CmtContent = "Đã tạo công việc",
                                MemberId = ESEIM.AppContext.UserName,
                                CreatedTime = DateTime.Now
                            };
                            _context.CardCommentLists.Add(comment);
                            var addLeader = new CardMapping
                            {
                                BoardCode = board.BoardCode,
                                ListCode = list.ListCode,
                                CardCode = card.CardCode,
                                UserId = ESEIM.AppContext.UserId,
                                CreatedBy = userName,
                                CreatedTime = DateTime.Now,
                                Responsibility = "ROLE_LEADER"
                            };
                            _context.CardMappings.Add(addLeader);
                            card.LstUser += ESEIM.AppContext.UserId + ",";
                            _context.SaveChanges();
                            return new
                            {
                                BoardCode = board.BoardCode,
                                Card = card,
                                ListCode = list.ListCode,
                            };
                        }
                        else
                        {
                            return Json("");
                        }
                    }
                }
                else
                {
                    var max = (from a in _context.WORKOSCards
                               join b in _context.JcObjectIdRelatives on a.CardCode equals b.CardCode
                               where !a.IsDeleted && !b.IsDeleted && b.ObjID == prams.objectCode && a.CreatedBy == userName
                               select a);
                    if (max.Count() > 0)
                    {
                        var maxId = max.Max(x => x.CardID);
                        var lastCard = _context.WORKOSCards.FirstOrDefault(x => x.CardID == maxId);

                        var list = _context.WORKOSLists.FirstOrDefault(x => x.ListCode == lastCard.ListCode && !x.IsDeleted);
                        var board = _context.WORKOSBoards.FirstOrDefault(x => x.BoardCode == list.BoardCode && !x.IsDeleted);
                        var listRela = _context.JcObjectIdRelatives.Where(x => !x.IsDeleted && x.CardCode == lastCard.CardCode);
                        var assign = _context.CardMappings.Where(x => x.CardCode == lastCard.CardCode);
                        var listGroup = assign.Where(x => x.TeamCode != null);
                        var listDepart = assign.Where(x => x.GroupUserCode != null);
                        var listMember = assign.Where(x => x.UserId != null);
                        var listAttach = _context.CardAttachments.Where(x => x.CardCode == lastCard.CardCode);
                        //Insert card and attr
                        var card = new WORKOSCard
                        {
                            CardName = "",
                            CardCode = "" + (_context.WORKOSCards.Count() > 0 ? _context.WORKOSCards.Max(x => x.CardID) + 1 : 1),
                            ListCode = lastCard.ListCode,
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedDate = DateTime.Now,
                            Currency = "CURRENCY_VND",
                            Status = "CREATED",
                            BeginTime = DateTime.Now,
                            Deadline = DateTime.Now
                        };
                        _context.WORKOSCards.Add(card);
                        var comment = new CardCommentList()
                        {
                            CardCode = card.CardCode,
                            CmtId = "Comment" + Guid.NewGuid().ToString(),
                            CmtContent = "Đã tạo công việc",
                            MemberId = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now
                        };
                        _context.CardCommentLists.Add(comment);
                        var addLeader = new CardMapping
                        {
                            BoardCode = board.BoardCode,
                            ListCode = list.ListCode,
                            CardCode = card.CardCode,
                            UserId = ESEIM.AppContext.UserId,
                            CreatedBy = userName,
                            CreatedTime = DateTime.Now,
                            Responsibility = "ROLE_LEADER"
                        };
                        _context.CardMappings.Add(addLeader);
                        card.LstUser += ESEIM.AppContext.UserId + ",";

                        //Add department of member create card
                        var cardDefaultDepartment = new CardMapping
                        {
                            BoardCode = prams.boardCode,
                            ListCode = lastCard.ListCode,
                            CardCode = card.CardCode,
                            GroupUserCode = user.DepartmentId,
                            CreatedBy = userName,
                            CreatedTime = DateTime.Now,
                            Responsibility = "ROLE_STAFF"
                        };
                        _context.CardMappings.Add(cardDefaultDepartment);
                        if (listGroup.Count() > 0)
                        {
                            foreach (var item in listGroup)
                            {
                                var cardMapping = new CardMapping
                                {
                                    BoardCode = prams.boardCode,
                                    ListCode = lastCard.ListCode,
                                    CardCode = card.CardCode,
                                    TeamCode = item.TeamCode,
                                    CreatedBy = userName,
                                    CreatedTime = DateTime.Now,
                                    Responsibility = item.Responsibility != null ? item.Responsibility : null
                                };
                                _context.CardMappings.Add(cardMapping);

                            }
                        }
                        if (listMember.Count() > 0)
                        {
                            foreach (var item in listMember)
                            {
                                card.LstUser += item.UserId + ",";
                                if (item.UserId != ESEIM.AppContext.UserId)
                                {
                                    var cardMapping = new CardMapping
                                    {
                                        BoardCode = prams.boardCode,
                                        ListCode = lastCard.ListCode,
                                        CardCode = card.CardCode,
                                        UserId = item.UserId,
                                        CreatedBy = userName,
                                        CreatedTime = DateTime.Now,
                                        Responsibility = item.Responsibility != null ? item.Responsibility : null
                                    };
                                    _context.CardMappings.Add(cardMapping);
                                }
                            }
                        }
                        if (listDepart.Count() > 0)
                        {
                            foreach (var item in listDepart)
                            {
                                var lstMemberInDepartment = _context.Users.Where(x => x.Active && x.DepartmentId == item.GroupUserCode);
                                foreach (var member in lstMemberInDepartment)
                                {
                                    card.LstUser += member.Id + ",";
                                }
                                if (item.GroupUserCode != cardDefaultDepartment.GroupUserCode)
                                {
                                    var cardMapping = new CardMapping
                                    {
                                        BoardCode = prams.boardCode,
                                        ListCode = lastCard.ListCode,
                                        CardCode = card.CardCode,
                                        GroupUserCode = item.GroupUserCode,
                                        CreatedBy = userName,
                                        CreatedTime = DateTime.Now,
                                        Responsibility = item.Responsibility != null ? item.Responsibility : null
                                    };
                                    _context.CardMappings.Add(cardMapping);
                                }
                            }
                        }
                        if (listRela.Count() > 0)
                        {
                            foreach (var item in listRela)
                            {
                                var rela = new JcObjectIdRelative
                                {
                                    CardCode = card.CardCode,
                                    ObjTypeCode = item.ObjTypeCode,
                                    ObjID = item.ObjID,
                                    Relative = item.Relative,
                                    CreatedBy = userName,
                                    CreatedTime = DateTime.Now,
                                    Weight = item.Weight.HasValue ? item.Weight.Value : 0
                                };
                                _context.JcObjectIdRelatives.Add(rela);
                            }
                        }
                        if (listAttach.Count() > 0)
                        {
                            foreach (var item in listAttach)
                            {
                                var attach = new CardAttachment
                                {
                                    CardCode = card.CardCode,
                                    FileCode = "ATTACHMENT" + DateTime.Now.ToString("ddMMyyyyHHmmss"),
                                    MemberId = userName,
                                    FileName = item.FileName,
                                    FileUrl = item.FileUrl,
                                    CreatedTime = DateTime.Now,
                                    ListPermissionViewFile = item.ListPermissionViewFile
                                };
                                _context.CardAttachments.Add(attach);
                            }

                        }
                        _context.SaveChanges();
                        return new
                        {
                            BoardCode = board.BoardCode,
                            Card = card,
                            ListCode = lastCard.ListCode,
                        };
                    }
                    else
                    {
                        var boards = _context.WORKOSBoards.Where(x => !x.IsDeleted);
                        if (boards.Any())
                        {
                            var board = boards.FirstOrDefault();
                            var list = _context.WORKOSLists.FirstOrDefault(x => x.BoardCode == board.BoardCode && !x.IsDeleted);
                            var card = new WORKOSCard
                            {
                                CardName = "",
                                CardCode = "" + (_context.WORKOSCards.Count() > 0 ? _context.WORKOSCards.Max(x => x.CardID) + 1 : 1),
                                ListCode = list.ListCode,
                                CreatedBy = ESEIM.AppContext.UserName,
                                CreatedDate = DateTime.Now,
                                Currency = "CURRENCY_VND",
                                Status = "CREATED",
                                BeginTime = DateTime.Now,
                                Deadline = DateTime.Now
                            };
                            _context.WORKOSCards.Add(card);
                            var comment = new CardCommentList()
                            {
                                CardCode = card.CardCode,
                                CmtId = "Comment" + Guid.NewGuid().ToString(),
                                CmtContent = "Đã tạo công việc",
                                MemberId = ESEIM.AppContext.UserName,
                                CreatedTime = DateTime.Now
                            };
                            _context.CardCommentLists.Add(comment);
                            var addLeader = new CardMapping
                            {
                                BoardCode = board.BoardCode,
                                ListCode = list.ListCode,
                                CardCode = card.CardCode,
                                UserId = ESEIM.AppContext.UserId,
                                CreatedBy = userName,
                                CreatedTime = DateTime.Now,
                                Responsibility = "ROLE_LEADER"
                            };
                            _context.CardMappings.Add(addLeader);
                            card.LstUser += ESEIM.AppContext.UserId + ",";
                            _context.SaveChanges();
                            return new
                            {
                                BoardCode = board.BoardCode,
                                Card = card,
                                ListCode = list.ListCode,
                            };
                        }
                        else
                        {
                            return Json("");
                        }
                    }
                }
            }
        }

        [HttpPost]
        public JsonResult GetInherit(string cardCode)
        {
            var data = _context.JcObjectIdRelatives.Where(x => x.CardCode == cardCode && !x.IsDeleted);
            var listCard = new List<ObjTemp>();
            foreach (var item in data)
            {
                var query = (from a in _context.JcObjectIdRelatives.Where(x => !x.IsDeleted && x.ObjID == item.ObjID)
                             join b in _context.WORKOSCards.Where(x => !x.IsDeleted) on a.CardCode equals b.CardCode
                             select new ObjTemp
                             {
                                 Code = b.CardCode,
                                 Name = b.CardName
                             }).DistinctBy(x => x.Code).ToList();
                listCard.AddRange(query);
            }
            return Json(listCard);
        }

        [HttpPost]
        public JsonResult UpdateInherit(string cardCode, string inherit)
        {
            var msg = new JMessage();
            try
            {
                var data = _context.WORKOSCards.FirstOrDefault(x => x.CardCode == cardCode && !x.IsDeleted);
                if (string.IsNullOrEmpty(data.Inherit))
                {
                    //log content
                    var activity = new CardUserActivity
                    {
                        UserId = ESEIM.AppContext.UserId,
                        Action = "UPDATE",
                        IdObject = "ITEMWORK",
                        IsCheck = true,
                        CardCode = cardCode,
                        CreatedTime = DateTime.Now,
                        FromDevice = "Laptop/Desktop",
                        ChangeDetails = "Chọn việc kế thừa " + (_context.WORKOSCards.FirstOrDefault(x => x.CardCode == inherit && !x.IsDeleted) != null ? _context.WORKOSCards.FirstOrDefault(x => x.CardCode == inherit && !x.IsDeleted).CardName : "")
                    };
                    _context.CardUserActivitys.Add(activity);
                }
                else
                {
                    //log content
                    var activity = new CardUserActivity
                    {
                        UserId = ESEIM.AppContext.UserId,
                        Action = "UPDATE",
                        IdObject = "ITEMWORK",
                        IsCheck = true,
                        CardCode = cardCode,
                        CreatedTime = DateTime.Now,
                        FromDevice = "Laptop/Desktop",
                        ChangeDetails = "Việc kế thừa từ " + (_context.WORKOSCards.FirstOrDefault(x => x.CardCode == cardCode && !x.IsDeleted) != null ? _context.WORKOSCards.FirstOrDefault(x => x.CardCode == data.Inherit && !x.IsDeleted).CardName : "")
                        + " sang " + (_context.WORKOSCards.FirstOrDefault(x => x.CardCode == inherit && !x.IsDeleted) != null ? _context.WORKOSCards.FirstOrDefault(x => x.CardCode == inherit && !x.IsDeleted).CardName : "")
                    };
                    _context.CardUserActivitys.Add(activity);
                }
                data.Inherit = inherit;
                var listRelaDes = _context.JcObjectIdRelatives.Where(x => !x.IsDeleted && x.CardCode == data.CardCode);
                var assignDes = _context.CardMappings.Where(x => x.CardCode == data.CardCode);
                var listGroupDes = assignDes.Where(x => x.TeamCode != null);
                var listDepartDes = assignDes.Where(x => x.GroupUserCode != null);
                var listMemberDes = assignDes.Where(x => x.UserId != null);
                var listAttachDes = _context.CardAttachments.Where(x => x.CardCode == data.CardCode);
                if (listRelaDes.Count() > 0)
                {
                    _context.JcObjectIdRelatives.RemoveRange(listRelaDes);
                }
                if (assignDes.Count() > 0)
                {
                    _context.CardMappings.RemoveRange(assignDes);
                }
                if (listAttachDes.Count() > 0)
                {
                    _context.CardAttachments.RemoveRange(listAttachDes);
                }

                var cardInherit = _context.WORKOSCards.FirstOrDefault(x => x.CardCode == inherit && !x.IsDeleted);
                var listRela = _context.JcObjectIdRelatives.Where(x => !x.IsDeleted && x.CardCode == cardInherit.CardCode);
                var assign = _context.CardMappings.Where(x => x.CardCode == cardInherit.CardCode);
                var listGroup = assign.Where(x => x.TeamCode != null);
                var listDepart = assign.Where(x => x.GroupUserCode != null);
                var listMember = assign.Where(x => x.UserId != null);
                var listAttach = _context.CardAttachments.Where(x => x.CardCode == cardInherit.CardCode);

                var listCode = _context.WORKOSLists.FirstOrDefault(x => x.ListCode == cardInherit.ListCode && !x.IsDeleted);
                var boardCode = _context.WORKOSBoards.FirstOrDefault(x => x.BoardCode == listCode.BoardCode && !x.IsDeleted);
                if (listRela.Count() > 0)
                {
                    foreach (var item in listRela)
                    {
                        var rela = new JcObjectIdRelative
                        {
                            CardCode = data.CardCode,
                            ObjTypeCode = item.ObjTypeCode,
                            ObjID = item.ObjID,
                            Relative = item.Relative,
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now,
                        };
                        _context.JcObjectIdRelatives.Add(rela);
                    }
                }
                if (listGroup.Count() > 0)
                {
                    foreach (var item in listGroup)
                    {
                        var cardMapping = new CardMapping
                        {
                            BoardCode = boardCode.BoardCode,
                            ListCode = cardInherit.ListCode,
                            CardCode = data.CardCode,
                            TeamCode = item.TeamCode,
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now,
                            Responsibility = item.Responsibility != null ? item.Responsibility : null
                        };
                        _context.CardMappings.Add(cardMapping);
                    }
                }
                if (listDepart.Count() > 0)
                {
                    foreach (var item in listDepart)
                    {
                        var cardMapping = new CardMapping
                        {
                            BoardCode = boardCode.BoardCode,
                            ListCode = cardInherit.ListCode,
                            CardCode = data.CardCode,
                            GroupUserCode = item.GroupUserCode,
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now,
                            Responsibility = item.Responsibility != null ? item.Responsibility : null
                        };
                        _context.CardMappings.Add(cardMapping);

                    }
                }
                if (listMember.Count() > 0)
                {
                    foreach (var item in listMember)
                    {
                        var cardMapping = new CardMapping
                        {
                            BoardCode = boardCode.BoardCode,
                            ListCode = data.ListCode,
                            CardCode = data.CardCode,
                            UserId = item.UserId,
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now,
                            Responsibility = item.Responsibility != null ? item.Responsibility : null
                        };
                        _context.CardMappings.Add(cardMapping);

                    }
                }
                if (listAttach.Count() > 0)
                {
                    foreach (var item in listAttach)
                    {
                        var attach = new CardAttachment
                        {
                            CardCode = data.CardCode,
                            FileCode = item.FileCode,
                            MemberId = ESEIM.AppContext.UserName,
                            FileName = item.FileName,
                            FileUrl = item.FileUrl,
                            CreatedTime = DateTime.Now,
                        };
                        _context.CardAttachments.Add(attach);
                    }

                }

                _context.SaveChanges();
                msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);

        }

        [HttpPost]
        public JsonResult ScopeCardProject()
        {
            var data = (from a in _context.WORKOSCards.Where(x => !x.IsDeleted && x.Status != "TRASH" && x.Status != "CANCLED")
                        join b in _context.JcObjectIdRelatives.Where(x => !x.IsDeleted && x.ObjTypeCode == "PROJECT") on a.CardCode equals b.CardCode
                        select new
                        {
                            a.CardID,
                            a.CardCode,
                            a.CardName
                        }).DistinctBy(x => x.CardCode);
            return Json(data);
        }

        [HttpPost]
        public JsonResult UpdateListCard(string cardCode, string listCode)
        {
            var msg = new JMessage();
            if (listCode == "")
            {
                msg.Error = true;
                msg.Title = _stringLocalizer["CJ_MSG_PLS_SELECT_LIST"];
            }

            if (listCode != "")
            {
                var data = _context.WORKOSCards.FirstOrDefault(x => x.CardCode == cardCode && !x.IsDeleted);
                data.ListCode = listCode;
                msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                _context.SaveChanges();
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult CopyCard(string cardCode)
        {
            var msg = new JMessage();
            try
            {
                var cardSrcCopy = _context.WORKOSCards.FirstOrDefault(x => x.CardCode == cardCode && !x.IsDeleted);
                var cardDesCopy = new WORKOSCard
                {
                    CardName = "Copy_" + cardSrcCopy.CardName,
                    CardCode = "" + (_context.WORKOSCards.Count() > 0 ? _context.WORKOSCards.Max(x => x.CardID) + 1 : 1),
                    ListCode = cardSrcCopy.ListCode,
                    CreatedBy = ESEIM.AppContext.UserName,
                    CreatedDate = DateTime.Now,
                    Status = "CREATED",
                    BeginTime = DateTime.Now,
                    Deadline = cardSrcCopy.Deadline,
                    EndTime = cardSrcCopy.EndTime,
                    Description = cardSrcCopy.Description
                };
                _context.WORKOSCards.Add(cardDesCopy);
                var comment = new CardCommentList()
                {
                    CardCode = cardDesCopy.CardCode,
                    CmtId = "Comment" + Guid.NewGuid().ToString(),
                    CmtContent = "Đã tạo công việc",
                    MemberId = ESEIM.AppContext.UserName,
                    CreatedTime = DateTime.Now
                };
                _context.CardCommentLists.Add(comment);

                var getList = _context.WORKOSLists.FirstOrDefault(x => x.ListCode == cardSrcCopy.ListCode && !x.IsDeleted);
                var getBoard = _context.WORKOSBoards.FirstOrDefault(x => x.BoardCode == getList.BoardCode && !x.IsDeleted);
                //Member assign
                var addLeader = new CardMapping
                {
                    BoardCode = getBoard.BoardCode,
                    ListCode = getList.ListCode,
                    CardCode = cardDesCopy.CardCode,
                    UserId = ESEIM.AppContext.UserId,
                    CreatedBy = ESEIM.AppContext.UserName,
                    CreatedTime = DateTime.Now,
                    Responsibility = "ROLE_LEADER"
                };
                _context.CardMappings.Add(addLeader);

                var assign = _context.CardMappings.Where(x => x.CardCode == cardSrcCopy.CardCode);
                foreach (var item in assign)
                {
                    var cardMapping = new CardMapping
                    {
                        BoardCode = getBoard.BoardCode,
                        ListCode = getList.ListCode,
                        CardCode = cardDesCopy.CardCode,
                        TeamCode = item.TeamCode != null ? item.TeamCode : null,
                        GroupUserCode = item.GroupUserCode != null ? item.GroupUserCode : null,
                        UserId = (item.UserId != null && addLeader.UserId != item.UserId) ? item.UserId : null,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now,
                        Responsibility = item.Responsibility != null ? item.Responsibility : null
                    };
                    _context.CardMappings.Add(cardMapping);
                }

                //Object relative
                var listRela = _context.JcObjectIdRelatives.Where(x => !x.IsDeleted && x.CardCode == cardSrcCopy.CardCode);
                foreach (var item in listRela)
                {
                    var rela = new JcObjectIdRelative
                    {
                        CardCode = cardDesCopy.CardCode,
                        ObjTypeCode = item.ObjTypeCode,
                        ObjID = item.ObjID,
                        Relative = item.Relative,
                        Weight = item.Weight.HasValue ? item.Weight.Value : 0,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now,
                    };
                    _context.JcObjectIdRelatives.Add(rela);
                }
                //File attachment in card
                var listAttach = _context.CardAttachments.Where(x => x.CardCode == cardSrcCopy.CardCode);
                foreach (var item in listAttach)
                {
                    var attach = new CardAttachment
                    {
                        CardCode = cardDesCopy.CardCode,
                        FileCode = "ATTACHMENT_" + DateTime.Now.ToString("ddMMyyyyHHmmss"),
                        MemberId = ESEIM.AppContext.UserName,
                        FileName = item.FileName,
                        FileUrl = item.FileUrl,
                        CreatedTime = DateTime.Now,
                    };
                    _context.CardAttachments.Add(attach);
                }
                //Location work
                var location = _context.WORKOSAddressCards.Where(x => x.CardCode == cardSrcCopy.CardCode && !x.IsDeleted);
                foreach (var item in location)
                {
                    var locationCard = new WORKOSAddressCard
                    {
                        CardCode = cardDesCopy.CardCode,
                        LocationGps = item.LocationGps,
                        LocationText = item.LocationText,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now
                    };
                    _context.WORKOSAddressCards.Add(locationCard);
                }
                //Product
                var products = _context.JcProducts.Where(x => x.CardCode == cardSrcCopy.CardCode && !x.IsDeleted);
                foreach (var item in products)
                {
                    var product = new JcProduct
                    {
                        CardCode = cardDesCopy.CardCode,
                        ProductCode = item.ProductCode,
                        Quantity = item.Quantity,
                        JcAct = item.JcAct,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now
                    };
                    _context.JcProducts.Add(product);
                }
                //Service
                var services = _context.JcServices.Where(x => x.CardCode == cardSrcCopy.CardCode && !x.IsDeleted);
                foreach (var item in services)
                {
                    var service = new JcService
                    {
                        CardCode = cardDesCopy.CardCode,
                        ServiceCode = item.ServiceCode,
                        Quantity = item.Quantity,
                        JcAct = item.JcAct,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now
                    };
                    _context.JcServices.Add(service);

                }
                //Card item check
                var cardItemChecks = _context.CardItemChecks.Where(x => x.CardCode == cardSrcCopy.CardCode && !x.Flag);
                foreach (var item in cardItemChecks)
                {
                    var code = "CHECK_LIST_" + (Guid.NewGuid().ToString());
                    var cardItem = new CardItemCheck
                    {
                        CardCode = cardDesCopy.CardCode,
                        CheckTitle = item.CheckTitle,
                        ChkListCode = code,
                        Percent = item.Percent,
                        Completed = item.Completed,
                        WeightNum = item.WeightNum,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now
                    };
                    _context.CardItemChecks.Add(cardItem);
                    //subitem
                    var subItems = _context.CardSubitemChecks.Where(x => x.ChkListCode == item.ChkListCode && !x.Flag);
                    var maxId = _context.CardSubitemChecks.Max(x => x.Id);
                    foreach (var i in subItems)
                    {
                        maxId = maxId + 1;
                        var subItem = new CardSubitemCheck()
                        {
                            ChkListCode = code,
                            Title = i.Title,
                            Approver = ESEIM.AppContext.UserName,
                            Approve = false
                        };
                        _context.CardSubitemChecks.Add(subItem);
                        //Work sub item activity
                        var subItemActivitys = _context.WorkItemAssignStaffs.Where(x => x.CardCode.Equals(cardSrcCopy.CardCode) && !x.IsDeleted && x.CheckListCode.Equals(i.ChkListCode) && x.CheckItem.Equals(i.Id.ToString()));
                        foreach (var subAct in subItemActivitys)
                        {
                            var jobCardUser = new WorkItemAssignStaff
                            {
                                CardCode = cardDesCopy.CardCode,
                                UserId = subAct.UserId,
                                CheckItem = maxId.ToString(),
                                CheckListCode = subItem.ChkListCode,
                                CreatedBy = ESEIM.AppContext.UserName,
                                CreatedTime = DateTime.Now
                            };
                            _context.WorkItemAssignStaffs.Add(jobCardUser);
                        }
                    }
                    //WorkItem activity
                    var data = _context.WorkItemAssignStaffs.Where(x => x.CardCode.Equals(cardSrcCopy.CardCode) && !x.IsDeleted && x.CheckListCode.Equals(item.ChkListCode) && x.CheckItem == "");
                    foreach (var k in data)
                    {
                        var jobCardUser = new WorkItemAssignStaff
                        {
                            CardCode = cardDesCopy.CardCode,
                            UserId = k.UserId,
                            CheckItem = "",
                            CheckListCode = cardItem.ChkListCode,
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now
                        };
                        _context.WorkItemAssignStaffs.Add(jobCardUser);
                    }
                }
                _context.SaveChanges();
                msg.Object = cardDesCopy;
                msg.Title = _stringLocalizer["CJ_MSG_COPY_CARD_SUCCESS"];
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpGet]
        public object UserCreatedCard(string cardCode)
        {
            var currentUser = ESEIM.AppContext.UserName;
            var data = _context.WORKOSCards.FirstOrDefault(x => x.CardCode == cardCode && !x.IsDeleted);
            var cardMapping = (from a in _context.CardMappings
                               join b in _context.Users on a.UserId equals b.Id
                               where a.CardCode == data.CardCode && a.Responsibility == "ROLE_LEADER_ACCEPTED"
                               select new
                               {
                                   b.UserName
                               }).DistinctBy(x => x.UserName);
            var check = false;
            if (currentUser == data.CreatedBy)
            {
                check = true;
            }
            else
            {
                foreach (var item in cardMapping)
                {
                    if (currentUser != item.UserName)
                    {
                        check = false;
                    }
                    else
                    {
                        check = true;
                        break;
                    }
                }
            }

            return check;
        }
        #endregion

        #region Member
        public class CardGroupOrMemberModel
        {
            public string CardCode { get; set; }
            public List<WORKOSTeamOrGroupCustom> ListObj { get; set; }
            public List<int> ListDeletedObj { get; set; }
            public List<CardMemberCustom> ListMember { get; set; }
            public List<int> ListDeleteMember { get; set; }
        }

        [HttpGet]
        public object GetListPageUser(int page, int length, string name)
        {
            var session = HttpContext.GetSessionUser();
            var user = _context.Users.FirstOrDefault(x => x.Active && x.UserName == ESEIM.AppContext.UserName);
            int intBeginFor = (page - 1) * length;
            var count = _context.Users.Where(x => (string.IsNullOrEmpty(name) || x.GivenName.ToLower().Contains(name.ToLower())) && x.Active == true && x.UserName != "admin" && session.IsAllData || session.ListUser.Any(p => p.Equals(x.Id))).Count();
            var data = _context.Users.Where(x => (string.IsNullOrEmpty(name) || (x.GivenName.ToLower().Contains(name.ToLower()))) &&
              (x.Active == true) && x.UserName != "admin" && (session.IsAllData || session.ListUser.Any(p => p.Equals(x.Id))))
              .OrderByDescending(x => x.CreatedDate).Skip(intBeginFor).Take(length)
              .Select(x => new
              {
                  x.Id,
                  Code = x.Id,
                  Name = x.GivenName,
                  CreatedTime = x.CreatedDate,
                  CountWork = (from a in _context.WORKOSCards.Where(k => k.Status != "TRASH")
                               let lt = a.LstUser.Split(",", StringSplitOptions.None)
                               join g in _context.CardMappings on a.CardCode equals g.CardCode into g1
                               from g2 in g1.DefaultIfEmpty()
                                   //where (!string.IsNullOrEmpty(a.LstUser) && lt.Any(y => x.Id == y) && a.IsDeleted == false &&
                                   //(session.IsAllData || g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(a.LstUser) && lt.Any(y => session.UserId == y)) || a.CreatedBy == session.UserName))
                               where !string.IsNullOrEmpty(a.LstUser) && lt.Any(y => x.Id == y) && a.IsDeleted == false && (session.IsAllData
                                || (session.IsUser && (g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(a.LstUser) && lt.Any(y => session.UserId == y)) || a.CreatedBy == session.UserName))
                                || (session.IsBranch && (!string.IsNullOrEmpty(a.LstUser) && lt.Any(k => k == session.UserId) || a.CreatedBy == session.UserName || session.ListUserOfBranch.Count() > 0 && session.ListUserOfBranch.Any(k => k == a.CreatedBy))))
                               select new
                               {
                                   a.CardID,
                                   a.CardCode
                               }).AsNoTracking().Distinct().Count(),
                  IsCheck = false
              });
            return (new
            {
                Tab = "Nhân viên",
                Icon = "fas fa-user",
                Total = count,
                ListData = data,
            });
        }

        [HttpPost]
        public JsonResult GetCardWithUser([FromBody]AdvanceSearchObj data)
        {
            if (data.ListObjCode.Any())
            {
                return Json(GetCardDataInUser(data));
            }
            else
            {
                return Json(GetCardDataOutUser(data));
            }
        }

        [NonAction]
        public object GetCardDataInUser(AdvanceSearchObj data)
        {
            var session = HttpContext.GetSessionUser();
            var user = _context.Users.FirstOrDefault(x => x.Active && x.UserName == ESEIM.AppContext.UserName);
            int intBeginFor = (data.Page - 1) * data.Length;
            var fromDate = string.IsNullOrEmpty(data.FromDate) ? (DateTime?)null : DateTime.ParseExact(data.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var toDate = string.IsNullOrEmpty(data.ToDate) ? (DateTime?)null : DateTime.ParseExact(data.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var query = (from a in _context.WORKOSCards
                         let lt = a.LstUser.Split(",", StringSplitOptions.None)
                         join b in _context.Users.Where(x => x.Active) on a.CreatedBy equals b.UserName
                         join g in _context.CardMappings on a.CardCode equals g.CardCode into g1
                         from g2 in g1.DefaultIfEmpty()
                         where (!string.IsNullOrEmpty(a.LstUser) && data.ListObjCode.Any(x => lt.Contains(x.Code))) &&
                         (fromDate == null || a.BeginTime >= fromDate) &&
                         (toDate == null || (a.EndTime.HasValue ? a.EndTime.Value.Date : DateTime.Now.Date) <= toDate) &&
                         (string.IsNullOrEmpty(data.Status) || (!string.IsNullOrEmpty(a.Status) && a.Status.Equals(data.Status))) &&
                         (string.IsNullOrEmpty(data.CardName) || a.CardName.ToUpper().Contains(data.CardName.ToUpper())) &&
                         (string.IsNullOrEmpty(data.BranchId) || b.BranchId.ToUpper().Equals(data.BranchId.ToUpper())) &&
                         a.IsDeleted == false
                         //(session.IsAllData || g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(a.LstUser) && lt.Any(y => session.UserId == y)) || a.CreatedBy == session.UserName)
                         && (session.IsAllData
                        || (session.IsUser && (g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(a.LstUser) && lt.Any(y => session.UserId == y)) || a.CreatedBy == session.UserName))
                        || (session.IsBranch && (!string.IsNullOrEmpty(a.LstUser) && lt.Any(k => k == session.UserId) || a.CreatedBy == session.UserName || session.ListUserOfBranch.Count() > 0 && session.ListUserOfBranch.Any(k => k == a.CreatedBy))))

                         group a by a.ListCode into g
                         select new
                         {
                             ListCode = g.Key,
                             ListCard = g.Select(y => new
                             {
                                 y.CardID,
                                 y.CardCode,
                                 y.CardName,
                                 y.Deadline,
                                 y.Quantitative,
                                 y.Unit,
                                 y.Currency,
                                 y.Status,
                                 BeginTime = y.BeginTime.ToString("dd/MM/yyyy"),
                                 EndTime = y.EndTime.HasValue ? y.EndTime.Value.ToString("dd/MM/yyyy") : "",
                                 y.Cost,
                                 y.Completed,
                                 y.LocationText,
                             }).Distinct()
                         });
            var list = (from a in query
                        join b in _context.WORKOSLists on a.ListCode equals b.ListCode
                        where b.IsDeleted == false
                        select new { a, b });
            var listPaging = list.Skip(intBeginFor).Take(data.Length).Select(x => new
            {
                x.b.ListID,
                x.b.ListCode,
                x.b.ListName,
                x.b.Completed,
                x.b.WeightNum,
                x.b.Status,
                x.b.BeginTime,
                x.b.Deadline,
                x.b.Background,
                x.b.Order,
                ListCard = x.a.ListCard.Select(y => new
                {
                    y.CardID,
                    y.CardCode,
                    y.CardName,
                    y.Deadline,
                    y.Quantitative,
                    y.Unit,
                    y.Currency,
                    CurrencyValue = _context.CommonSettings.FirstOrDefault(z => z.CodeSet == y.Currency).ValueSet ?? "",
                    y.BeginTime,
                    y.EndTime,
                    Status = _context.CommonSettings.FirstOrDefault(z => z.CodeSet == y.Status).ValueSet ?? "",
                    CountCheckListDone = _context.CardItemChecks.Where(z => z.CardCode == y.CardCode && z.Completed == 100 && z.Flag == false).Count(),
                    CountCheckList = _context.CardItemChecks.Where(z => z.CardCode == y.CardCode && z.Flag == false).Count(),
                    y.Cost,
                    y.Completed,
                    y.LocationText,
                })
            });
            return new
            {
                Data = listPaging,
                Total = list.Count(),
            };
        }

        [NonAction]
        public object GetCardDataOutUser(AdvanceSearchObj data)
        {
            var session = HttpContext.GetSessionUser();
            var user = _context.Users.FirstOrDefault(x => x.Active && x.UserName == ESEIM.AppContext.UserName);
            int intBeginFor = (data.Page - 1) * data.Length;
            var fromDate = string.IsNullOrEmpty(data.FromDate) ? (DateTime?)null : DateTime.ParseExact(data.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var toDate = string.IsNullOrEmpty(data.ToDate) ? (DateTime?)null : DateTime.ParseExact(data.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            //danh sách card mới,thẻ mới
            if (fromDate == null && toDate == null && string.IsNullOrEmpty(data.CardName) && string.IsNullOrEmpty(data.Status) && string.IsNullOrEmpty(data.BranchId))
            {
                var query = (from a in _context.WORKOSCards
                             let lt = a.LstUser.Split(",", StringSplitOptions.None)
                             join g in _context.CardMappings on a.CardCode equals g.CardCode into g1
                             from g2 in g1.DefaultIfEmpty()
                             where a.CreatedDate.Date == DateTime.Today && a.IsDeleted == false
                             //(session.IsAllData || g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(a.LstUser) && lt.Any(y => session.UserId == y)) || a.CreatedBy == session.UserName)
                             && (session.IsAllData
                            || (session.IsUser && (g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(a.LstUser) && lt.Any(y => session.UserId == y)) || a.CreatedBy == session.UserName))
                            || (session.IsBranch && (!string.IsNullOrEmpty(a.LstUser) && lt.Any(k => k == session.UserId) || a.CreatedBy == session.UserName || session.ListUserOfBranch.Count() > 0 && session.ListUserOfBranch.Any(k => k == a.CreatedBy))))

                             group a by a.ListCode into g
                             select new
                             {
                                 ListCode = g.Key,
                             }).AsNoTracking();
                var list = (from a in _context.WORKOSLists
                            from b in query
                            where ((a.ListCode == b.ListCode) || (a.CreatedDate.Date == DateTime.Today) && a.IsDeleted == false)
                            select a).Distinct().AsNoTracking();
                var listPaging = list.Skip(intBeginFor).Take(data.Length).Select(x => new
                {
                    x.ListID,
                    x.ListCode,
                    x.ListName,
                    x.Completed,
                    x.WeightNum,
                    x.Status,
                    x.BeginTime,
                    x.Deadline,
                    x.Background,
                    x.Order,
                    ListCard = _context.WORKOSCards.Where(y => y.ListCode == x.ListCode && y.CreatedDate.Date == DateTime.Today && y.IsDeleted == false).Select(y => new
                    {
                        y.CardID,
                        y.CardCode,
                        y.CardName,
                        y.Deadline,
                        y.Quantitative,
                        y.Unit,
                        y.Currency,
                        CurrencyValue = _context.CommonSettings.FirstOrDefault(z => z.CodeSet == y.Currency).ValueSet ?? "",
                        BeginTime = y.BeginTime.ToString("dd/MM/yyyy"),
                        EndTime = y.EndTime.HasValue ? y.EndTime.Value.ToString("dd/MM/yyyy") : "",
                        Status = _context.CommonSettings.FirstOrDefault(z => z.CodeSet == y.Status).ValueSet ?? "",
                        CountCheckListDone = _context.CardItemChecks.Where(z => z.CardCode == y.CardCode && z.Completed == 100 && z.Flag == false).Count(),
                        CountCheckList = _context.CardItemChecks.Where(z => z.CardCode == y.CardCode && z.Flag == false).Count(),
                        y.Cost,
                        y.Completed,
                        y.LocationText,
                    }).Distinct()
                });
                return new
                {
                    Data = listPaging,
                    Total = list.Count(),
                };
            }
            else
            {
                var query = (from a in _context.WORKOSCards
                             let lt = a.LstUser.Split(",", StringSplitOptions.None)
                             join g in _context.CardMappings on a.CardCode equals g.CardCode into g1
                             from g2 in g1.DefaultIfEmpty()
                             join b in _context.Users.Where(x => x.Active) on a.CreatedBy equals b.UserName
                             where (fromDate == null || a.BeginTime >= fromDate) &&
                             (toDate == null || (a.EndTime.HasValue ? a.EndTime.Value.Date : DateTime.Now.Date) <= toDate) &&
                             (string.IsNullOrEmpty(data.CardName) || a.CardName.ToUpper().Contains(data.CardName.ToUpper())) &&
                             (string.IsNullOrEmpty(data.Status) || a.Status.Equals(data.Status)) &&
                             (string.IsNullOrEmpty(data.BranchId) || b.BranchId.Equals(data.BranchId)) &&
                             a.IsDeleted == false
                             //(session.IsAllData || g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(a.LstUser) && lt.Any(y => session.UserId == y)) || a.CreatedBy == session.UserName)
                             && (session.IsAllData
                            || (session.IsUser && (g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(a.LstUser) && lt.Any(y => session.UserId == y)) || a.CreatedBy == session.UserName))
                            || (session.IsBranch && (!string.IsNullOrEmpty(a.LstUser) && lt.Any(k => k == session.UserId) || a.CreatedBy == session.UserName || session.ListUserOfBranch.Count() > 0 && session.ListUserOfBranch.Any(k => k == a.CreatedBy))))

                             group a by a.ListCode into g
                             select new
                             {
                                 ListCode = g.Key,
                                 ListCard = g.Select(y => new
                                 {
                                     y.CardID,
                                     y.CardCode,
                                     y.CardName,
                                     y.Deadline,
                                     y.Quantitative,
                                     y.Unit,
                                     y.Currency,
                                     y.Status,
                                     BeginTime = y.BeginTime.ToString("dd/MM/yyyy"),
                                     EndTime = y.EndTime.HasValue ? y.EndTime.Value.ToString("dd/MM/yyyy") : "",
                                     y.Cost,
                                     y.Completed,
                                     y.LocationText,
                                 }).Distinct()
                             }).AsNoTracking();
                var list = (from a in query
                            join b in _context.WORKOSLists on a.ListCode equals b.ListCode
                            where b.IsDeleted == false
                            select new { a, b });
                var listPaging = list.Skip(intBeginFor).Take(data.Length).Select(x => new
                {
                    x.b.ListID,
                    x.b.ListCode,
                    x.b.ListName,
                    x.b.Completed,
                    x.b.WeightNum,
                    x.b.Status,
                    x.b.BeginTime,
                    x.b.Deadline,
                    x.b.Background,
                    x.b.Order,
                    ListCard = x.a.ListCard.Select(y => new
                    {
                        y.CardID,
                        y.CardCode,
                        y.CardName,
                        y.Deadline,
                        y.Quantitative,
                        y.Unit,
                        y.Currency,
                        CurrencyValue = _context.CommonSettings.FirstOrDefault(z => z.CodeSet == y.Currency).ValueSet ?? "",
                        y.BeginTime,
                        y.EndTime,
                        Status = _context.CommonSettings.FirstOrDefault(z => z.CodeSet == y.Status).ValueSet ?? "",
                        CountCheckListDone = _context.CardItemChecks.Where(z => z.CardCode == y.CardCode && z.Completed == 100 && z.Flag == false).Count(),
                        CountCheckList = _context.CardItemChecks.Where(z => z.CardCode == y.CardCode && z.Flag == false).Count(),
                        y.Cost,
                        y.Completed,
                        y.LocationText,
                    })
                });
                return new
                {
                    Data = listPaging,
                    Total = list.Count(),
                };
            }
        }

        [NonAction]
        public IQueryable<GridCardJtable> GetGirdCardUser(AdvanceSearchObj dataSearch)
        {
            IQueryable<GridCardJtable> query = null;
            if (dataSearch.ListObjCode.Any())
            {
                query = GetGirdCardInUser(dataSearch);
            }
            else
            {
                query = GetGirdCardOutUser(dataSearch);
            }
            return query;
        }

        [NonAction]
        public IQueryable<GridCardJtable> GetGirdCardInUser(AdvanceSearchObj dataSearch)
        {
            var session = HttpContext.GetSessionUser();
            var user = _context.Users.FirstOrDefault(x => x.Active && x.UserName == ESEIM.AppContext.UserName);
            var fromDate = string.IsNullOrEmpty(dataSearch.FromDate) ? (DateTime?)null : DateTime.ParseExact(dataSearch.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var toDate = string.IsNullOrEmpty(dataSearch.ToDate) ? (DateTime?)null : DateTime.ParseExact(dataSearch.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var query = (from a in _context.WORKOSCards.Where(x => !x.IsDeleted)
                         join b in _context.CommonSettings on a.Currency equals b.CodeSet into b1
                         from b in b1.DefaultIfEmpty()
                         join d in _context.CommonSettings on a.Status equals d.CodeSet into d1
                         from d in d1.DefaultIfEmpty()
                         join f in _context.Users on a.CreatedBy equals f.UserName into f1
                         from f2 in f1.DefaultIfEmpty()
                         join g in _context.CardMappings on a.CardCode equals g.CardCode into g1
                         from g2 in g1.DefaultIfEmpty()
                         join h in _context.Users.Where(x => x.Active) on a.CreatedBy equals h.UserName into h1
                         from h2 in h1.DefaultIfEmpty()
                         join h in _context.WORKOSLists.Where(x => !x.IsDeleted) on a.ListCode equals h.ListCode
                         join k in _context.WORKOSBoards.Where(x => !x.IsDeleted) on h.BoardCode equals k.BoardCode
                         let lt = a.LstUser.Split(",", StringSplitOptions.None)
                         where (!string.IsNullOrEmpty(a.LstUser) && dataSearch.ListObjCode.Any(x => lt.Contains(x.Code))) &&
                         (fromDate == null || a.BeginTime >= fromDate) &&
                         (toDate == null || (a.EndTime.HasValue ? a.EndTime.Value.Date : DateTime.Now.Date) <= toDate) &&
                         ((string.IsNullOrEmpty(dataSearch.Status) && a.Status != "TRASH") || a.Status.Equals(dataSearch.Status)) &&
                         ((string.IsNullOrEmpty(dataSearch.CardName) || a.CardCode.ToLower().Contains(dataSearch.CardName.ToLower())) ||
                         (string.IsNullOrEmpty(dataSearch.CardName) || a.CardName.ToUpper().Contains(dataSearch.CardName.ToUpper()))) &&
                         (string.IsNullOrEmpty(dataSearch.BranchId) || f2.BranchId.ToUpper().Equals(dataSearch.BranchId.ToUpper())) &&
                         //(session.IsAllData || g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(a.LstUser) && lt.Any(y => session.UserId == y)) || a.CreatedBy == session.UserName)
                         (session.IsAllData
                            || (session.IsUser && (g2.GroupUserCode == user.DepartmentId || (!string.IsNullOrEmpty(a.LstUser) && lt.Any(y => session.UserId == y)) || a.CreatedBy == session.UserName))
                            || (session.IsBranch && (!string.IsNullOrEmpty(a.LstUser) && lt.Any(k => k == session.UserId) || a.CreatedBy == session.UserName || session.ListUserOfBranch.Count() > 0 && session.ListUserOfBranch.Any(k => k == a.CreatedBy))))
                         select new GridCardJtable
                         {
                             CardID = a.CardID,
                             CardCode = a.CardCode,
                             CardName = a.CardName,
                             Deadline = a.Deadline,
                             BoardName = k.BoardName,
                             Cost = a.Cost,
                             Completed = a.Completed,
                             BeginTime = a.BeginTime,
                             EndTime = a.EndTime,
                             Currency = b != null ? b.ValueSet : "",
                             Status = d != null ? d.ValueSet : "",
                             UpdateTime = a.UpdatedTime,
                             CreatedBy = h2.GivenName,
                             CreatedTime = a.CreatedDate.ToString("dd/MM/yyyy"),
                             CreatedDate = a.CreatedDate,
                             UpdatedTimeTxt = a.UpdatedTime.HasValue ? a.UpdatedTime.Value.ToString("dd/MM/yyyy HH:mm:ss") : "",
                             WorkType = !string.IsNullOrEmpty(a.WorkType) ? _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.WorkType).ValueSet : "",
                             Priority = !string.IsNullOrEmpty(a.CardLevel) ? _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.CardLevel).ValueSet : "",
                         }).DistinctBy(x => x.CardCode).OrderByDescending(x => x.UpdateTime.HasValue ? x.UpdateTime.Value : x.CreatedDate).ThenByDescending(x => x.CardID);
            IQueryable<GridCardJtable> data1 = query.AsQueryable<GridCardJtable>();
            return data1;
        }

        [NonAction]
        public IQueryable<GridCardJtable> GetGirdCardOutUser(AdvanceSearchObj dataSearch)
        {
            return GetGirdCardOut(dataSearch);
        }
        #endregion

        #region CheckList
        [HttpPost]
        public JsonResult AddCheckList([FromBody]CardItemCheck obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var getSumWeightNum = _context.CardItemChecks.Where(x => x.CardCode == obj.CardCode && x.Flag == false).Sum(x => x.WeightNum);
                if ((getSumWeightNum + obj.WeightNum) > 100)
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["CJ_MSG_MAXIMUM_WEIGHT"] + (100 - getSumWeightNum) + " % !";
                }
                else
                {
                    //var code = "CHECK_LIST_" + (Guid.NewGuid().ToString());
                    var data = new CardItemCheck()
                    {
                        CardCode = obj.CardCode,
                        CheckTitle = obj.CheckTitle,
                        WeightNum = obj.WeightNum,
                        ChkListCode = obj.ChkListCode,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now
                    };
                    var activity = new CardUserActivity
                    {
                        UserId = ESEIM.AppContext.UserId,
                        Action = "ADD",
                        IdObject = "ITEMCHECK",
                        IsCheck = true,
                        CardCode = obj.CardCode,
                        CreatedTime = DateTime.Now,
                        FromDevice = "Laptop/Desktop",
                        ChangeDetails = obj.CheckTitle
                    };
                    _context.CardUserActivitys.Add(activity);
                    _context.CardItemChecks.Add(data);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                //msg.Title = String.Format(_stringLocalize["COM_MSG_ADD_FAILED"), _stringLocalize["")); //"Có lỗi xảy ra khi thêm!";
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult GetMaxWeightNumCheckList(string CardCode)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var getSumWeightNum = _context.CardItemChecks.Where(x => x.CardCode == CardCode && x.Flag == false).Sum(x => x.WeightNum);
                if (getSumWeightNum > 100)
                {
                    msg.Error = true;
                    //msg.Title = "Trọng số hiện tại đã vượt qua 100%!";
                    msg.Title = _stringLocalizer["CJ_MSG_WEIGHT_OVER_HUNDRED_PERCENT"];
                }
                else
                {
                    var maxWeightNum = 100 - getSumWeightNum;
                    msg.Object = maxWeightNum;
                }
            }
            catch (Exception)
            {
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult GetCheckLists(string CardCode)
        {
            var data = _context.CardItemChecks.Where(x => !x.Flag && x.CardCode == CardCode)
                  .Select(x => new
                  {
                      x.Id,
                      x.ChkListCode,
                      x.CheckTitle,
                      x.Completed,
                      x.WeightNum,
                      checkItem = false,
                      TitleSubItemChk = "",
                      x.CreatedBy,
                      x.CreatedTime,
                      ListUserItemChk = (from a in _context.WorkItemAssignStaffs
                                         join b in _context.Users on a.UserId equals b.Id
                                         where a.CheckListCode == x.ChkListCode && a.IsDeleted == false && (a.CheckItem == "")
                                         select new
                                         {
                                             a.ID,
                                             UserId = b.Id,
                                             b.UserName,
                                             b.GivenName,
                                             a.EstimateTime,
                                             Status = _context.CommonSettings.FirstOrDefault(y => y.CodeSet == a.Unit && !y.IsDeleted).ValueSet,
                                             Unit = a.Unit,
                                             a.CreatedBy,
                                             a.CreatedTime
                                         }),
                      ListSubItem = _context.CardSubitemChecks.Where(y => y.ChkListCode == x.ChkListCode && y.Flag == false).Select(y => new
                      {
                          y.Id,
                          y.Title,
                          y.Approve,
                          y.ApprovedTime,
                          y.Completed,
                          y.Approver,
                          y.WeightNum,
                          ListUserSubItem = (from a in _context.WorkItemAssignStaffs
                                             join b in _context.Users on a.UserId equals b.Id
                                             where a.CheckItem == y.Id.ToString() && a.IsDeleted == false
                                             select new
                                             {
                                                 a.ID,
                                                 UserId = b.Id,
                                                 b.UserName,
                                                 b.GivenName,
                                                 a.EstimateTime,
                                                 a.CreatedBy,
                                                 a.CreatedTime,
                                                 Status = _context.CommonSettings.FirstOrDefault(k => k.CodeSet == a.Unit && !k.IsDeleted).ValueSet,
                                                 Unit = a.Unit
                                             }),
                      }).OrderByDescending(n => n.Id),
                      ListItemActivity = (from a in _context.WORKItemSessions
                                          join c in _context.WORKItemSessionResults on a.WorkSession equals c.WorkSession
                                          join d in _context.SessionItemChkItems on c.WorkSession equals d.Session
                                          join e in _context.CardItemChecks on d.Item equals e.ChkListCode
                                          where a.ItemWorkList.Equals(x.ChkListCode) && c.IsDeleted == false
                                          select new
                                          {
                                              Id = c.Id,
                                              StartTime = c.StartTime,
                                              EndTime = c.EndTime,
                                              ProgressFromLeader = c.ProgressFromLeader,
                                              ProgressFromStaff = c.ProgressFromStaff,
                                              CheckTitle = e.CheckTitle,
                                              ShiftCode = c.ShiftCode,
                                              TimeCheckIn = _context.ShiftLogs.FirstOrDefault(z => z.ShiftCode == c.ShiftCode).ChkinTime.Value.ToString("HH:mm dd/MM/yyyy"),
                                              TimeCheckOut = _context.ShiftLogs.FirstOrDefault(z => z.ShiftCode == c.ShiftCode).ChkoutTime.HasValue ? _context.ShiftLogs.FirstOrDefault(z => z.ShiftCode == c.ShiftCode).ChkoutTime.Value.ToString("HH:mm dd/MM/yyyy") : "",
                                              CreatedBy = c.CreatedBy,
                                              UserAssessor = c.UserAssessor
                                          }).DistinctBy(y => y.Id),
                  }).OrderByDescending(k => k.CreatedTime).ToList();
            return Json(data);
        }

        [HttpPost]
        public JsonResult UpdateCheckList([FromBody] CardItemCheck obj)
        {
            var msg = new JMessage();
            try
            {
                var data = _context.CardItemChecks.FirstOrDefault(x => !x.Flag && x.ChkListCode == obj.ChkListCode);
                var getSumWeightNum = _context.CardItemChecks.Where(x => x.CardCode == obj.CardCode && x.Flag == false).Sum(x => x.WeightNum);
                if ((getSumWeightNum - data.WeightNum + obj.WeightNum) > 100)
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["CJ_MSG_MAXIMUM_WEIGHT"] + (100 - getSumWeightNum - data.WeightNum) + " % !";
                }
                else
                {
                    if (data != null)
                    {
                        data.CheckTitle = obj.CheckTitle;
                        data.WeightNum = obj.WeightNum;
                        _context.CardItemChecks.Update(data);
                        _context.SaveChanges();
                        msg.Title = _sharedResources["COM_MSG_UPDATE_SUCCESS"];
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Error = true;
            }
            return Json(msg);
        }

        public class UserTemp
        {
            public string UserId { get; set; }
            public string GivenName { get; set; }
        }
        [HttpPost]
        public JsonResult AddCheckItem([FromBody]CardSubitemCheck obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                //var getSumWeightNum = _context.CardSubitemChecks.Where(x => x.ChkListCode == CheckCode && x.Flag == false).Sum(x => x.WeightNum);
                //if ((getSumWeightNum + WeightNum) > 100)
                //{
                //    msg.Error = true;
                //    msg.Title = "Trọng số tối đa cho phép " + (100 - getSumWeightNum) + "%!";
                //}
                //else
                //{
                //var subItemCheck = _context.CardSubitemChecks.Where(x => x.ChkListCode == CheckCode && x.Flag == false);
                var data = new CardSubitemCheck()
                {
                    ChkListCode = obj.ChkListCode,
                    Title = obj.Title,
                    Approver = ESEIM.AppContext.UserName,
                    Approve = false
                };
                var itemCheck = _context.CardItemChecks.FirstOrDefault(x => x.ChkListCode == obj.ChkListCode);
                _context.CardSubitemChecks.Add(data);
                _context.CardSubitemChecks.Load();
                msg.Object = _cardService.UpdatePercentParentSubItem(data.ChkListCode);

                var activity = new CardUserActivity
                {
                    UserId = ESEIM.AppContext.UserId,
                    Action = "ADD",
                    IdObject = "SUBITEM",
                    IsCheck = true,
                    CardCode = itemCheck.CardCode,
                    CreatedTime = DateTime.Now,
                    FromDevice = "Laptop/Desktop",
                    ChangeDetails = obj.Title
                };
                _context.CardUserActivitys.Add(activity);

                _context.SaveChanges();
                //msg.Title = String.Format(_stringLocalize["COM_MSG_ADD_SUCCESS"), _stringLocalize[""));//"Thêm thành công!";
                msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                //}
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                //msg.Title = String.Format(_stringLocalize["COM_MSG_ADD_FAILED"), _stringLocalize["")); //"Có lỗi xảy ra khi thêm!";
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult GetCheckItem(string CheckCode)
        {
            //var data = _context.CardSubitemChecks.Where(x => x.ChkListCode.Equals(CheckCode) && x.Flag == false).ToList();
            var data = _context.CardSubitemChecks.Where(x => x.ChkListCode.Equals(CheckCode) && x.Flag == false).Select(x => new
            {
                x.Id,
                x.Title,
                x.WeightNum,
                x.Approve,
                ListUserSubItem = (from a in _context.WorkItemAssignStaffs
                                   join b in _context.Users on a.UserId equals b.Id
                                   where a.CheckItem.Equals(x.Id.ToString()) && !a.IsDeleted
                                   select new
                                   {
                                       a.UserId,
                                       b.GivenName
                                   }),

            });
            return Json(data);
        }
        [HttpPost]
        public JsonResult DeleteCheckItem(int Id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = _context.CardSubitemChecks.FirstOrDefault(x => x.Id == Id);
                data.Flag = true;
                _context.CardSubitemChecks.Update(data);
                _context.CardSubitemChecks.Load();
                msg.Object = _cardService.UpdatePercentParentSubItem(data.ChkListCode);

                var itemCheck = _context.CardItemChecks.FirstOrDefault(x => x.ChkListCode == data.ChkListCode);
                var activity = new CardUserActivity
                {
                    UserId = ESEIM.AppContext.UserId,
                    Action = "DELETE",
                    IdObject = "SUBITEM",
                    IsCheck = true,
                    CardCode = itemCheck.CardCode,
                    CreatedTime = DateTime.Now,
                    FromDevice = "Laptop/Desktop",
                    ChangeDetails = data.Title
                };
                _context.CardUserActivitys.Add(activity);

                _context.SaveChanges();
                //msg.Title = String.Format(_stringLocalize["COM_MSG_DELETE_SUCCESS"), _stringLocalize["")); //"Xóa thành công";
                msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                //msg.Title = String.Format(_stringLocalize["COM_MSG_DELETE_FAIL"), _stringLocalize[""));// "Có lỗi xảy ra!";
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult ChangeCheckTitle([FromBody]CardItemCheck obj)
        {
            var msg = new JMessage() { Error = true };
            try
            {
                var data = _context.CardItemChecks.FirstOrDefault(x => x.ChkListCode.Equals(obj.ChkListCode));
                if (data.CheckTitle.Equals(obj.CheckTitle))
                {
                    return null;
                }
                var activity = new CardUserActivity
                {
                    UserId = ESEIM.AppContext.UserId,
                    Action = "UPDATE",
                    IdObject = "ITEMCHECK",
                    IsCheck = true,
                    CardCode = obj.CardCode,
                    CreatedTime = DateTime.Now,
                    FromDevice = "Laptop/Desktop",
                    ChangeDetails = "Tiêu đề từ " + data.CheckTitle + " sang " + obj.CheckTitle
                };
                _context.CardUserActivitys.Add(activity);
                data.CheckTitle = obj.CheckTitle;
                _context.CardItemChecks.Update(data);
                _context.SaveChanges();

                //msg.Title = String.Format(_stringLocalize["COM_MSG_UPDATE_SUCCESS"), _stringLocalize[""));// "Cập nhật thành công!";
                msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                msg.Error = false;
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                //msg.Title = String.Format(_stringLocalize["COM_MSG_UPDATE_FAILED"), _stringLocalize[""));// "Có lỗi xảy ra!";
                return Json(msg);
            }
        }
        [HttpPost]
        public JsonResult ChangeItemStatus(int Id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = _context.CardSubitemChecks.FirstOrDefault(x => x.Id == Id);
                var itemCheck = _context.CardItemChecks.FirstOrDefault(x => x.ChkListCode == data.ChkListCode);
                if (data.Approve != true)
                {
                    data.Approve = true;
                    data.Approver = ESEIM.AppContext.UserName;
                    data.ApprovedTime = DateTime.Now;
                    data.Completed = 100;
                    var activity = new CardUserActivity
                    {
                        UserId = ESEIM.AppContext.UserId,
                        Action = "UPDATE",
                        IdObject = "SUBITEM",
                        IsCheck = true,
                        CardCode = itemCheck.CardCode,
                        CreatedTime = DateTime.Now,
                        FromDevice = "Laptop/Desktop",
                        ChangeDetails = "Tích chọn hoàn thành đầu mục việc con " + data.Title
                    };
                    _context.CardUserActivitys.Add(activity);
                }
                else
                {
                    data.Approve = false;
                    data.Approver = null;
                    data.ApprovedTime = null;
                    data.Completed = 0;
                    var activity = new CardUserActivity
                    {
                        UserId = ESEIM.AppContext.UserId,
                        Action = "UPDATE",
                        IdObject = "SUBITEM",
                        IsCheck = true,
                        CardCode = itemCheck.CardCode,
                        CreatedTime = DateTime.Now,
                        FromDevice = "Laptop/Desktop",
                        ChangeDetails = "Bỏ tích chọn hoàn thành đầu mục việc con " + data.Title
                    };
                    _context.CardUserActivitys.Add(activity);
                }
                _context.CardSubitemChecks.Update(data);
                _context.CardSubitemChecks.Load();
                msg.Object = _cardService.UpdatePercentParentSubItem(data.ChkListCode);
                _context.SaveChanges();
                msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                //msg.Title = String.Format(_stringLocalize["COM_MSG_UPDATE_FAILED"), _stringLocalize["")); // "Có lỗi xảy ra!";
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult ChangeItemTitle([FromBody]CardSubitemCheck obj)
        {
            var msg = new JMessage() { Error = true };
            try
            {
                var data = _context.CardSubitemChecks.FirstOrDefault(x => x.Id == obj.Id);
                if (data.Title.Equals(obj.Title))
                {
                    return null;
                }

                var itemCheck = _context.CardItemChecks.FirstOrDefault(x => x.ChkListCode == data.ChkListCode);
                var activity = new CardUserActivity
                {
                    UserId = ESEIM.AppContext.UserId,
                    Action = "UPDATE",
                    IdObject = "SUBITEM",
                    IsCheck = true,
                    CardCode = itemCheck.CardCode,
                    CreatedTime = DateTime.Now,
                    FromDevice = "Laptop/Desktop",
                    ChangeDetails = "Tiêu đề từ " + data.Title + " sang " + obj.Title
                };
                _context.CardUserActivitys.Add(activity);

                data.Title = obj.Title;
                _context.CardSubitemChecks.Update(data);
                _context.SaveChanges();
                msg.Error = false;
                msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                //msg.Title = String.Format(_stringLocalize["COM_MSG_UPDATE_FAILED"), _stringLocalize["")); //"Có lỗi xảy ra!";
                return Json(msg);
            }
        }
        [HttpPost]
        public JsonResult DeleteCheckList(string CheckCode)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            var userName = ESEIM.AppContext.UserName;
            try
            {
                //deleted item
                var data = _context.CardItemChecks.FirstOrDefault(x => x.ChkListCode.Equals(CheckCode));
                if (data.CreatedBy == userName)
                {
                    var checkWorkItem = _context.SessionItemChkItems.FirstOrDefault(x => !x.IsDeleted && x.Item == data.ChkListCode);
                    if (checkWorkItem == null)
                    {
                        data.Flag = true;
                        data.DeletedBy = userName;
                        data.DeletedTime = DateTime.Now;
                        _context.CardItemChecks.Update(data);
                        _context.CardItemChecks.Load();

                        //deleted subitem
                        var listSubItem = _context.CardSubitemChecks.Where(x => x.ChkListCode == data.ChkListCode).AsNoTracking().ToList();
                        listSubItem.ForEach(x => x.Flag = false);
                        _context.CardSubitemChecks.UpdateRange(listSubItem);

                        var activity = new CardUserActivity
                        {
                            UserId = ESEIM.AppContext.UserId,
                            Action = "DELETE",
                            IdObject = "ITEMCHECK",
                            IsCheck = true,
                            CardCode = data.CardCode,
                            CreatedTime = DateTime.Now,
                            FromDevice = "Laptop/Desktop",
                            ChangeDetails = data.CheckTitle
                        };
                        _context.CardUserActivitys.Add(activity);

                        msg.Object = _cardService.UpdatePercentParentItem(data.CardCode);
                        _context.SaveChanges();
                        //msg.Title = String.Format(_stringLocalize["COM_MSG_DELETE_SUCCESS"), _stringLocalize[""));// "Xóa thành công";
                        msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["CJ_MSG_CANNOT_DELETE"];
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["CJ_MSG_CANNOT_DELETE"];
                }
            }
            catch (Exception ex)
            {
                msg.Object = ex;
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                //msg.Title = String.Format(_stringLocalize["COM_MSG_DELETE_FAIL"), _stringLocalize[""));//"Có lỗi khi xóa!";
            }
            return Json(msg);
        }

        #endregion

        #region Comment
        [HttpPost]
        public JsonResult AddComment([FromBody]CardCommentList obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                string code = "COMMENT_" + obj.CardCode + "_" + (_context.CardCommentLists.Count() > 0 ? _context.CardCommentLists.Last().Id + 1 : 0);
                CardCommentList data = new CardCommentList()
                {
                    CardCode = obj.CardCode,
                    CmtId = code,
                    CmtContent = obj.CmtContent,
                    MemberId = ESEIM.AppContext.UserName,
                    CreatedTime = DateTime.Now
                };

                var activity = new CardUserActivity
                {
                    UserId = ESEIM.AppContext.UserId,
                    IdObject = "CMT",
                    Action = "ADD",
                    IsCheck = true,
                    CardCode = data.CardCode,
                    CreatedTime = DateTime.Now,
                    FromDevice = "Laptop/Desktop",
                    ChangeDetails = obj.CmtContent
                };
                _context.CardUserActivitys.Add(activity);

                _context.CardCommentLists.Add(data);
                _context.SaveChanges();

                msg.Error = false;
                msg.Title = String.Format(_sharedResources["COM_ADD_SUCCESS"], _stringLocalizer["CJ_MSG_COMMENT"]);
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                return Json(msg);
            }
        }
        [HttpPost]
        public JsonResult GetComments(string CardCode)
        {
            var query = (from a in _context.CardCommentLists
                         join b in _context.Users on a.MemberId equals b.UserName
                         where a.CardCode == CardCode
                         select new
                         {
                             a.Id,
                             b.GivenName,
                             b.Picture,
                             a.MemberId,
                             a.CmtContent,
                             a.CreatedTime,
                             a.UpdatedTime,
                             a.CardCode,
                             UpdatedBy = a.UpdatedBy != null ? _context.Users.FirstOrDefault(x => x.UserName == a.UpdatedBy).GivenName : ""
                         }).OrderByDescending(x => x.CreatedTime);
            return Json(query);
        }
        [HttpPost]
        public JsonResult DeleteComment(int id)
        {
            var msg = new JMessage() { Error = true };
            var currentUser = ESEIM.AppContext.UserName;
            try
            {
                var data = _context.CardCommentLists.FirstOrDefault(x => x.Id.Equals(id));
                if (currentUser == data.MemberId)
                {
                    //data.Flag = true;
                    _context.CardCommentLists.Remove(data);
                    var activity = new CardUserActivity
                    {
                        UserId = ESEIM.AppContext.UserId,
                        IdObject = "CMT",
                        Action = "DELETE",
                        IsCheck = true,
                        CardCode = data.CardCode,
                        CreatedTime = DateTime.Now,
                        FromDevice = "Laptop/Desktop",
                        ChangeDetails = data.CmtContent
                    };
                    _context.CardUserActivitys.Add(activity);
                    _context.SaveChanges();

                    msg.Error = false;
                    //msg.Title = String.Format(_stringLocalize["COM_MSG_DELETE_SUCCESS"), _stringLocalize[""));//"Xóa thành công";
                    msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["CJ_MSG_CANNOT_DELETE"];
                }

                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                //msg.Title = String.Format(_stringLocalize["COM_MSG_DELETE_FAIL"), _stringLocalize[""));// "Có lỗi khi xóa!";
                return Json(msg);
            }
        }
        [HttpPost]
        public JsonResult UpdateComment([FromBody]CardCommentList obj)
        {
            var msg = new JMessage() { Error = true };
            if (string.IsNullOrEmpty(obj.CmtContent))
            {
                msg.Title = _stringLocalizer["CJ_CURD_MSG_ADD_CONTENT"];// "Nhập nội dung!";
                return Json(msg);
            }
            else
            {
                if (obj.CmtContent.Length > 255)
                {
                    //msg.Title = "255 ký tự!";
                    msg.Title = _stringLocalizer["CJ_MSG_LIMIT_CHARACTER"];
                    return Json(msg);
                }
            }
            try
            {
                var currentUser = ESEIM.AppContext.UserName;
                var data = _context.CardCommentLists.First(x => x.Id.Equals(obj.Id));
                if (data.CmtContent.Equals(obj.CmtContent))
                {
                    return null;
                }
                if (data.MemberId == currentUser)
                {
                    var activity = new CardUserActivity
                    {
                        UserId = ESEIM.AppContext.UserId,
                        IdObject = "CMT",
                        Action = "UPDATE",
                        IsCheck = true,
                        CardCode = data.CardCode,
                        CreatedTime = DateTime.Now,
                        FromDevice = "Laptop/Desktop",
                        ChangeDetails = "Bình luận từ " + data.CmtContent + " sang " + obj.CmtContent
                    };
                    _context.CardUserActivitys.Add(activity);

                    data.CmtContent = obj.CmtContent;
                    data.UpdatedBy = ESEIM.AppContext.UserName;
                    data.UpdatedTime = DateTime.Now;
                    _context.SaveChanges();

                    msg.Error = false;
                    //msg.Title = String.Format(_stringLocalize["COM_MSG_UPDATE_SUCCESS"), _stringLocalize[""));// "Cập nhật thành công";
                    msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["CJ_MSG_CANNOT_UPDATE_CMT"];
                }
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                //msg.Title = String.Format(_stringLocalize["COM_MSG_UPDATE_FAILED"), _stringLocalize[""));// "Có lỗi khi cập nhật!";
                return Json(msg);
            }
        }
        #endregion

        #region Attachment
        [HttpPost]
        public JsonResult AddAttachment([FromBody]CardAttachment data)
        {
            var msg = new JMessage() { Error = true };
            try
            {
                var card = _context.WORKOSCards.FirstOrDefault(x => x.CardCode == data.CardCode && !x.IsDeleted);
                string code = "ATTACHMENT_" + data.CardCode + "_" + (_context.CardAttachments.Count() > 0 ? _context.CardAttachments.Last().Id + 1 : 0);
                data.FileCode = code;
                data.CreatedTime = DateTime.Now;
                data.MemberId = ESEIM.AppContext.UserName;
                data.ListPermissionViewFile = card.LstUser;

                var activity = new CardUserActivity
                {
                    UserId = ESEIM.AppContext.UserId,
                    IdObject = "FILE",
                    Action = "ADD",
                    IsCheck = true,
                    CardCode = data.CardCode,
                    CreatedTime = DateTime.Now,
                    FromDevice = "Laptop/Desktop",
                    ChangeDetails = data.FileName
                };

                _context.CardUserActivitys.Add(activity);
                _context.CardAttachments.Add(data);
                _context.SaveChanges();

                msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["CJ_CURD_TAB_ADD_ATTACHMENT"]); //"Thêm thành công";
                msg.Error = false;
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                //msg.Title = String.Format(_stringLocalize["COM_MSG_ADD_FAILED"), _stringLocalize["CJ_CURD_TAB_ADD_ATTACHMENT"));//"Có lỗi xảy ra!";
                return Json(msg);
            }
        }
        [HttpPost]
        public JsonResult GetAttachment(string CardCode)
        {
            var data = _context.CardAttachments.Where(x => x.CardCode.Equals(CardCode) && x.Flag == false).ToList();
            return Json(data);
        }
        [HttpPost]
        public object GetFilePath(string filePath, string cardCode)
        {
            var msg = new JMessage();

            var extension = Path.GetExtension(filePath);
            var attachment = _context.CardAttachments.FirstOrDefault(x => x.FileUrl == filePath && x.CardCode == cardCode);
            var session = HttpContext.GetSessionUser();
            var listUserEdit = new List<string>();
            if (string.IsNullOrEmpty(attachment.ListUserView))
            {
                listUserEdit.Add(session.FullName);
                attachment.ListUserView = JsonConvert.SerializeObject(listUserEdit);
            }
            else
            {
                var checkExits = JsonConvert.DeserializeObject<List<string>>(attachment.ListUserView);
                msg.ID = -1;
                msg.Error = true;
                msg.Title = string.Format("Tệp đang được chỉnh sửa bởi {0}", string.Join(",", checkExits));
                if (!checkExits.Any(x => x.Equals(session.FullName)))
                {
                    checkExits.Add(session.FullName);
                    attachment.ListUserView = JsonConvert.SerializeObject(checkExits);
                }
            }

            var asean = new AseanDocument();
            asean.File_Code = attachment.FileCode;
            asean.Mode = 2;
            asean.File_Path = "";
            asean.FirstPage = "/Admin/CardJob";
            if (extension.ToUpper() == ".DOCX" || extension.ToUpper() == ".DOC")
            {
                DocmanController.pathFile = filePath;
                DocmanController.cardCode = cardCode;
                DocmanController.docmodel = asean;
            }
            if (extension.ToUpper() == ".XLSX" || extension.ToUpper() == ".XLS")
            {
                ExcelController.pathFile = filePath;
                ExcelController.cardCode = cardCode;
                ExcelController.docmodel = asean;
            }
            if (extension.ToUpper() == ".PDF")
            {
                PDFController.pathFile = filePath;
            }
            attachment.IsEdit = true;
            attachment.UpdatedTime = DateTime.Now;
            _context.SaveChanges();

            return msg;
        }
        [HttpPost]
        [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
        [RequestSizeLimit(long.MaxValue)]
        public object UploadFile(IFormFile fileUpload)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var upload = _upload.UploadFile(fileUpload, Path.Combine(_hostingEnvironment.WebRootPath, "uploads\\files"));
                if (upload.Error)
                {
                    msg.Error = true;
                    msg.Title = upload.Title;
                }
                else
                {
                    msg.Object = upload.Object;
                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                //msg.Title = String.Format(_stringLocalize["COM_ERR_UPLOAD_FILE")); //"Có lỗi xảy ra khi upload file!"; 
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult DeleteAttachment(string FileCode)
        {
            var msg = new JMessage() { Error = true };
            var currentUser = ESEIM.AppContext.UserName;
            try
            {
                var data = _context.CardAttachments.FirstOrDefault(x => x.FileCode.Equals(FileCode));
                if (data.MemberId == currentUser)
                {
                    _context.CardAttachments.Remove(data);
                    var activity = new CardUserActivity
                    {
                        UserId = ESEIM.AppContext.UserId,
                        IdObject = "FILE",
                        Action = "DELETE",
                        IsCheck = true,
                        CardCode = data.CardCode,
                        CreatedTime = DateTime.Now,
                        FromDevice = "Laptop/Desktop",
                        ChangeDetails = data.FileName
                    };

                    _context.CardUserActivitys.Add(activity);
                    _context.SaveChanges();

                    msg.Error = false;
                    //msg.Title = String.Format(_stringLocalize["COM_MSG_DELETE_SUCCESS"), _stringLocalize["")); //"Xóa thành công";
                    msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["CJ_MSG_CANNOT_DELETE"];
                }

                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                //msg.Title = String.Format(_stringLocalize["COM_MSG_DELETE_FAIL"), _stringLocalize[""));//"Có lỗi xảy ra!";
                return Json(msg);
            }
        }

        [HttpPost]
        public JsonResult GetListUserFile(int Id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var query = _context.CardAttachments.FirstOrDefault(x => x.Id == Id && !x.Flag);
                if (query != null)
                {
                    var listPermission = !string.IsNullOrEmpty(query.ListPermissionViewFile) ? query.ListPermissionViewFile.Split(",", StringSplitOptions.None) : new string[0];
                    msg.Object = (from a in _context.Users
                                  join b in listPermission on a.Id equals b
                                  select new
                                  {
                                      a.Id,
                                      a.UserName,
                                      a.GivenName
                                  }).DistinctBy(x => x.UserName);
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
        public JsonResult UpdateListPermissionViewFile(int Id, string ListPermissionViewFile)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.CardAttachments.FirstOrDefault(x => x.Id == Id && !x.Flag);
                if (data != null)
                {
                    data.ListPermissionViewFile = ListPermissionViewFile;
                    _context.CardAttachments.Update(data);
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
        #endregion

        #region Obj Dependency
        public class Properties
        {
            public string Code { get; set; }
            public string Name { get; set; }
        }

        [HttpPost]
        public JsonResult GetObjDependency()
        {
            var list = new List<Properties>();
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
        public JsonResult GetObjTypeJC()
        {
            var data = _context.JcObjectTypes.Where(x => !x.IsDeleted).Select(x => new { Code = x.ObjTypeCode, Name = x.ObjTypeName });
            return Json(data);
        }
        [HttpPost]
        public JsonResult GetObjFromObjType(string code)
        {
            List<ObjTemp> listTemp = new List<ObjTemp>();
            listTemp = GetListObjTemp(code);
            return Json(listTemp);
        }
        public class ObjTemp
        {
            public string Code { get; set; }
            public string Name { get; set; }
        }
        [HttpPost]
        public JsonResult InsertJcObjectIdRelative([FromBody]dynamic data)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                string cardCode = data.CardCode.Value;
                if (data.ListDeletedDependency.Count > 0)
                {
                    for (int i = 0; i < data.ListDeletedDependency.Count; i++)
                    {
                        int idDeleted = data.ListDeletedDependency[i].Value != null ? Convert.ToInt32(data.ListDeletedDependency[i].Value) : 0;
                        if (idDeleted > 0)
                        {
                            var currentData = _context.JcObjectIdRelatives.FirstOrDefault(x => x.ID == idDeleted);
                            if (currentData != null)
                            {
                                currentData.IsDeleted = true;
                                currentData.DeletedBy = ESEIM.AppContext.UserName;
                                currentData.DeletedTime = DateTime.Now;
                                _context.JcObjectIdRelatives.Update(currentData);
                            }
                        }
                    }
                }
                if (data.ListDependency.Count > 0)
                {
                    for (int i = 0; i < data.ListDependency.Count; i++)
                    {
                        int id = data.ListDependency[i].Id.Value != null ? Convert.ToInt32(data.ListDependency[i].Id.Value) : 0;
                        if (id < 0)
                        {
                            var objRelative = new JcObjectIdRelative();
                            decimal Weight = data.ListDependency[i].Weight.Value != null ? Convert.ToDecimal(data.ListDependency[i].Weight.Value) : 0;
                            objRelative.Weight = Weight;
                            objRelative.CardCode = cardCode;
                            objRelative.ObjTypeCode = data.ListDependency[i].ObjTypeCode.Value;
                            objRelative.ObjID = data.ListDependency[i].ObjCode.Value;
                            objRelative.Relative = data.ListDependency[i].Relative.Value;
                            objRelative.CreatedBy = ESEIM.AppContext.UserName;
                            objRelative.CreatedTime = DateTime.Now;
                            _context.JcObjectIdRelatives.Add(objRelative);
                            var dataCardJob = _context.WORKOSCards.FirstOrDefault(x => x.CardCode == cardCode && !x.IsDeleted);
                            var dataCardList = _context.WORKOSLists.FirstOrDefault(x => x.ListCode == dataCardJob.ListCode && !x.IsDeleted);


                            if (objRelative.ObjTypeCode == "PROJECT")
                            {
                                var objCardMap = new CardMapping();
                                objCardMap.ListCode = dataCardJob.ListCode;
                                objCardMap.BoardCode = dataCardList.BoardCode;
                                objCardMap.ProjectCode = objRelative.ObjID;
                                objCardMap.CardCode = cardCode;
                                objCardMap.CreatedBy = ESEIM.AppContext.UserName;
                                objCardMap.CreatedTime = DateTime.Now;
                                _context.CardMappings.Add(objCardMap);
                            };
                            if (objRelative.ObjTypeCode == "CONTRACT")
                            {
                                var objCardMap = new CardMapping();
                                objCardMap.ListCode = dataCardJob.ListCode;
                                objCardMap.BoardCode = dataCardList.BoardCode;
                                objCardMap.ContractCode = objRelative.ObjID;
                                objCardMap.CardCode = cardCode;
                                objCardMap.CreatedBy = ESEIM.AppContext.UserName;
                                objCardMap.CreatedTime = DateTime.Now;
                                _context.CardMappings.Add(objCardMap);
                            };


                        }
                    }
                }
                _context.SaveChanges();
                //msg.Title = String.Format(_stringLocalize["COM_MSG_UPDATE_SUCCESS"), _stringLocalize[""));//"Cập nhật thành công";
                msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                // msg.Title = String.Format(_stringLocalize["COM_MSG_UPDATE_FAILED"), _stringLocalize[""));//"Có lỗi xảy ra!";
                return Json(msg);
            }
        }

        public class CheckWeightNumberModel
        {
            public string ObjTypeCode { get; set; }
            public string ObjID { get; set; }
            public decimal WeightNum { get; set; }
        };
        [HttpPost]
        public JsonResult CheckWeightNumber([FromBody]CheckWeightNumberModel obj)
        {
            var msg = new JMessage();

            var getSumWeightNum = _context.JcObjectIdRelatives.Where(x => x.ObjTypeCode == obj.ObjTypeCode && !x.IsDeleted && x.ObjID == obj.ObjID).Sum(x => x.Weight);
            if ((getSumWeightNum + obj.WeightNum) > 100)
            {
                msg.Error = true;
                msg.Title = _stringLocalizer["CJ_MSG_MAXIMUM_WEIGHT"] + (100 - getSumWeightNum) + " % !";
            }
            else
            {
                msg.Error = false;
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult DeleteJcObjectIdRelative(int ids)
        {
            var msg = new JMessage();

            var data = _context.JcObjectIdRelatives.FirstOrDefault(x => x.ID == ids && !x.IsDeleted);
            if (data != null)
            {
                data.IsDeleted = true;
                data.DeletedBy = ESEIM.AppContext.UserName;
                data.DeletedTime = DateTime.Now;
                _context.JcObjectIdRelatives.Update(data);
                msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
            }
            else
            {
                msg.Error = true;
                msg.Title = _stringLocalizer["CJ_MSG_NOT_FIND_OBJECT_DELETE"];
            }
            _context.SaveChanges();
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetObjectTypeRelative(string CardCode)
        {
            List<ObjTemp> list = new List<ObjTemp>();
            list = GetListObjTemp(CardCode);
            var data = from a in _context.WORKOSCards
                       join b in _context.JcObjectIdRelatives on a.CardCode equals b.CardCode into b1
                       from b2 in b1.DefaultIfEmpty()
                       where !a.IsDeleted && !b2.IsDeleted
                       select new
                       {
                           ID = b2.ID,
                           ObjID = b2.ObjID != null ? b2.ObjID : ""
                       };
            var data1 = from a in data
                        join b in list on a.ObjID equals b.Code
                        select new
                        {
                            a.ObjID,
                            b.Name
                        };
            return Json(data1);
        }

        [NonAction]
        public List<ObjTemp> GetListObjTemp(string code)
        {
            var query = _context.JcObjectTypes.FirstOrDefault(x => x.ObjTypeCode.Equals(code) && !x.IsDeleted);
            List<ObjTemp> listTemp = new List<ObjTemp>();
            using (var command = _context.Database.GetDbConnection().CreateCommand())
            {
                command.CommandText = query.ScriptSQL;
                _context.Database.OpenConnection();
                using (var result = command.ExecuteReader())
                {
                    while (result.Read())
                    {
                        if (result != null)
                        {
                            if (code == "CONTRACT_PO")
                            {
                                var objTemp = new ObjTemp
                                {
                                    Code = result.GetString(4),
                                    Name = result.GetString(3)
                                };
                                if (objTemp != null)
                                {
                                    listTemp.Add(objTemp);
                                }
                            }
                            else
                            {
                                var objTemp = new ObjTemp
                                {
                                    Code = result.GetString(1),
                                    Name = result.GetString(2)
                                };
                                if (objTemp != null)
                                {
                                    listTemp.Add(objTemp);
                                }
                            }
                        }

                    }
                }
                _context.Database.CloseConnection();
            }
            return listTemp;
        }

        [HttpPost]
        public JsonResult SetObjectRelative([FromBody]dynamic data)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                string cardCode = data.CardCode.Value;
                for (int i = 0; i < data.ListDeletedDependency.Count; i++)
                {
                    int idDeleted = data.ListDeletedDependency[i].Value != null ? Convert.ToInt32(data.ListDeletedDependency[i].Value) : 0;
                    if (idDeleted > 0)
                    {
                        var currentData = _context.CardMappings.FirstOrDefault(x => x.Id.Equals(idDeleted));
                        if (currentData != null)
                        {
                            _context.CardMappings.Remove(currentData);
                        }
                    }
                }
                if (data.ListDependency.Count > 0)
                {
                    var card = _context.WORKOSCards.FirstOrDefault(x => x.CardCode == cardCode);
                    var list = _context.WORKOSLists.FirstOrDefault(x => x.ListCode == card.ListCode);
                    var board = _context.WORKOSBoards.FirstOrDefault(x => x.BoardCode == list.BoardCode);
                    for (int i = 0; i < data.ListDependency.Count; i++)
                    {
                        int id = data.ListDependency[i].Id.Value != null ? Convert.ToInt32(data.ListDependency[i].Id.Value) : 0;
                        if (id < 0)
                        {
                            string objCode = data.ListDependency[i].ObjCode.Value;
                            string dependency = data.ListDependency[i].Dependency.Value;
                            string relative = data.ListDependency[i].Relative.Value;
                            var cardForObj = new CardMapping()
                            {
                                BoardCode = board.BoardCode,
                                ListCode = card.ListCode,
                                CardCode = cardCode,
                                ProjectCode = (dependency == EnumHelper<ProjectEnum>.GetDisplayValue(ProjectEnum.Project)) ? objCode : null,
                                ContractCode = (dependency == EnumHelper<ContractEnum>.GetDisplayValue(ContractEnum.Contract)) ? objCode : null,
                                CustomerCode = (dependency == EnumHelper<CustomerEnum>.GetDisplayValue(CustomerEnum.Customer)) ? objCode : null,
                                SupplierCode = (dependency == EnumHelper<SupplierEnum>.GetDisplayValue(SupplierEnum.Supplier)) ? objCode : null,
                                Relative = relative,
                                CreatedBy = ESEIM.AppContext.UserName,
                                CreatedTime = DateTime.Now,
                            };
                            _context.CardMappings.Add(cardForObj);
                        }
                    }
                }
                _context.SaveChanges();
                //msg.Title = String.Format(_stringLocalize["COM_MSG_UPDATE_SUCCESS"), _stringLocalize[""));//"Cập nhật thành công";
                msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                // msg.Title = String.Format(_stringLocalize["COM_MSG_UPDATE_FAILED"), _stringLocalize[""));//"Có lỗi xảy ra!";
                return Json(msg);
            }
        }

        public class ObjTempRela
        {
            public int ID { get; set; }
            public string Code { get; set; }
            public string Name { get; set; }
        }
        [HttpPost]
        public JsonResult GetObjectRelative(string CardCode)
        {
            var data = (from a in _context.JcObjectTypes
                        join b in _context.JcObjectIdRelatives on a.ObjTypeCode equals b.ObjTypeCode
                        where !a.IsDeleted && !b.IsDeleted && b.CardCode == CardCode
                        select new
                        {
                            Sql = a.ScriptSQL,
                            Code = a.ObjTypeCode
                        }).DistinctBy(x => x.Code).ToList();


            List<ObjTempRela> listTemp = new List<ObjTempRela>();

            using (var command = _context.Database.GetDbConnection().CreateCommand())
            {
                _context.Database.OpenConnection();
                foreach (var item in data)
                {
                    command.CommandText = item.Sql;
                    using (var result = command.ExecuteReader())
                    {
                        while (result.Read())
                        {
                            if (result != null)
                            {
                                if (item.Code == "CONTRACT_PO")
                                {
                                    var objTemp = new ObjTempRela
                                    {
                                        ID = result.GetInt32(0),
                                        Code = result.GetString(4),
                                        Name = result.GetString(3)
                                    };
                                    if (objTemp != null)
                                    {
                                        listTemp.Add(objTemp);
                                    }
                                }
                                else
                                {
                                    var objTemp = new ObjTempRela
                                    {
                                        ID = result.GetInt32(0),
                                        Code = result.GetString(1),
                                        Name = result.GetString(2)
                                    };
                                    if (objTemp != null)
                                    {
                                        listTemp.Add(objTemp);
                                    }
                                }

                            }

                        }
                    }
                }
                _context.Database.CloseConnection();
            }
            var data2 = (from a in _context.JcObjectIdRelatives
                         join b in listTemp on a.ObjID equals b.Code
                         join c in _context.JcObjectTypes on a.ObjTypeCode equals c.ObjTypeCode
                         where a.CardCode == CardCode && !a.IsDeleted
                         select new
                         {
                             ID = a.ID,
                             ObjName = b.Name,
                             ObjTypeName = c.ObjTypeName,
                             ObjTypeCode = c.ObjTypeCode,
                             ObjID = b.Code,
                             RelativeCode = a.Relative,
                             RelativeName = _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(a.Relative)).ValueSet,
                             Weight = a.Weight.ToString() != null ? a.Weight.ToString() : "",
                             IdObjTemp = b.ID
                         }).DistinctBy(x => new { x.ObjTypeCode, x.RelativeCode, x.ObjID });
            return Json(data2);
        }

        [HttpPost]
        public JsonResult DeleteCardDependency(int Id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = _context.JcObjectIdRelatives.FirstOrDefault(x => x.ID == Id && !x.IsDeleted);
                data.IsDeleted = true;
                data.DeletedBy = ESEIM.AppContext.UserName;
                data.DeletedTime = DateTime.Now;
                _context.JcObjectIdRelatives.Update(data);
                _context.SaveChanges();
                msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
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
        public JsonResult GetRelative()
        {
            var data = _context.CommonSettings.Where(x => x.Group.Equals(EnumHelper<CardEnum>.GetDisplayValue(CardEnum.ObjRelative)) && x.IsDeleted == false)
                            .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return Json(data);
        }

        [NonAction]
        public string GetObjectRelativeName(string objCode, string objType)
        {
            var result = "";
            if (objType == EnumHelper<ProjectEnum>.GetDisplayValue(ProjectEnum.Project))
            {
                result = _context.Projects.FirstOrDefault(x => x.ProjectCode == objCode && !x.FlagDeleted)?.ProjectTitle;
            }
            else if (objType == EnumHelper<ContractEnum>.GetDisplayValue(ContractEnum.Contract))
            {
                result = _context.PoSaleHeaders.FirstOrDefault(x => x.ContractCode == objCode && !x.IsDeleted)?.Title;
            }
            else if (objType == EnumHelper<CustomerEnum>.GetDisplayValue(CustomerEnum.Customer))
            {
                result = _context.Customerss.FirstOrDefault(x => x.CusCode == objCode && !x.IsDeleted)?.CusName;
            }
            else if (objType == EnumHelper<SupplierEnum>.GetDisplayValue(SupplierEnum.Supplier))
            {
                result = _context.Suppliers.FirstOrDefault(x => x.SupCode == objCode && !x.IsDeleted)?.SupName;
            }
            return result;
        }
        #endregion

        #region Product
        [HttpPost]
        public object GetProduct()
        {
            return _context.MaterialProducts.Where(x => !x.IsDeleted).Select(x => new { Code = x.ProductCode, Name = x.ProductName }).AsNoTracking();
        }

        //[HttpPost]
        //public object GetCardProduct(string CardCode)
        //{
        //    var query = from a in _context.CardProducts
        //                join b in _context.MaterialProducts on a.ProductCode equals b.ProductCode
        //                where a.CardCode == CardCode
        //                select new
        //                {
        //                    a.Id,
        //                    a.CreatedTime,
        //                    a.CreatedBy,
        //                    a.Quantity,
        //                    b.ProductCode,
        //                    b.ProductName,
        //                };
        //    return query;
        //}

        [HttpPost]
        public object GetCardProduct(string CardCode)
        {
            var query = from a in _context.JcProducts
                        join b in _context.MaterialProducts on a.ProductCode equals b.ProductCode
                        where a.CardCode == CardCode && !a.IsDeleted
                        select new
                        {
                            a.ID,
                            a.CreatedTime,
                            a.CreatedBy,
                            a.Quantity,
                            b.ProductCode,
                            b.ProductName,
                        };
            return query;
        }

        [HttpPost]
        public JsonResult InsertProduct([FromBody]JcProduct product)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var checkExist = _context.JcProducts.FirstOrDefault(x => x.CardCode == product.CardCode && x.ProductCode == product.ProductCode && !x.IsDeleted);
                if (checkExist != null)
                {
                    checkExist.Quantity += product.Quantity;
                    _context.JcProducts.Update(checkExist);
                }
                else
                {
                    product.CreatedBy = ESEIM.AppContext.UserName;
                    product.CreatedTime = DateTime.Now;
                    _context.JcProducts.Add(product);
                }
                var activity = new CardUserActivity
                {
                    UserId = ESEIM.AppContext.UserId,
                    IdObject = "PROD",
                    Action = "ADD",
                    IsCheck = true,
                    CardCode = product.CardCode,
                    CreatedTime = DateTime.Now,
                    FromDevice = "Laptop/Desktop",
                    ChangeDetails = _context.MaterialProducts.FirstOrDefault(x => x.ProductCode == product.ProductCode).ProductName
                };
                _context.CardUserActivitys.Add(activity);
                _context.SaveChanges();
                //msg.Title = "Thêm sản phẩm thành công!";
                msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["CJ_MSG_PRODUCT"]);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                //msg.Title = "Có lỗi khi thêm sản phẩm!";
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }
        [HttpGet]
        public JsonResult DeleteProduct(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var cardProduct = _context.JcProducts.FirstOrDefault(x => x.ID == id);
                if (cardProduct != null)
                {
                    cardProduct.IsDeleted = true;
                    cardProduct.DeletedBy = ESEIM.AppContext.UserName;
                    cardProduct.DeletedTime = DateTime.Now;
                    _context.Update(cardProduct);

                    var activity = new CardUserActivity
                    {
                        UserId = ESEIM.AppContext.UserId,
                        IdObject = "PROD",
                        Action = "DELETE",
                        IsCheck = true,
                        CardCode = cardProduct.CardCode,
                        CreatedTime = DateTime.Now,
                        FromDevice = "Laptop/Desktop",
                        ChangeDetails = _context.MaterialProducts.FirstOrDefault(x => x.ProductCode == cardProduct.ProductCode).ProductName
                    };
                    _context.CardUserActivitys.Add(activity);

                    _context.SaveChanges();
                    //msg.Title = "Xóa sản phẩm thành công!";
                    msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer["CJ_MSG_PRODUCT"]);
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Sản phẩm không tồn tại!";
                    msg.Title = _stringLocalizer["CJ_MSG_PRODUCT_NOT_EXISTS"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                //msg.Title = "Có lỗi khi thêm sản phẩm!";
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetActivityProduct()
        {
            var data = _context.CommonSettings.Where(x => x.Group == "JC_ACTIVITY_PRODUCT" && !x.IsDeleted).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return Json(data);
        }
        #endregion

        #region Service
        [HttpPost]
        public object GetService()
        {
            return _context.ServiceCategorys.Where(x => !x.IsDeleted).Select(x => new { Code = x.ServiceCode, Name = x.ServiceName }).AsNoTracking();
        }

        [HttpPost]
        public object GetCardService(string CardCode)
        {
            var query = from a in _context.JcServices
                        join b in _context.ServiceCategorys on a.ServiceCode equals b.ServiceCode
                        where a.CardCode == CardCode && !a.IsDeleted
                        select new
                        {
                            a.ID,
                            a.CreatedTime,
                            a.CreatedBy,
                            a.Quantity,
                            b.ServiceCode,
                            b.ServiceName,
                        };
            return query;
        }

        [HttpPost]
        public JsonResult InsertService([FromBody]JcService service)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var checkExist = _context.JcServices.FirstOrDefault(x => x.CardCode == service.CardCode && x.ServiceCode == service.ServiceCode && !x.IsDeleted);
                if (checkExist != null)
                {
                    checkExist.Quantity += service.Quantity;
                    _context.JcServices.Update(checkExist);
                }
                else
                {
                    service.CreatedBy = ESEIM.AppContext.UserName;
                    service.CreatedTime = DateTime.Now;
                    _context.JcServices.Add(service);
                }

                var activity = new CardUserActivity
                {
                    UserId = ESEIM.AppContext.UserId,
                    IdObject = "SER",
                    Action = "ADD",
                    IsCheck = true,
                    CardCode = service.CardCode,
                    CreatedTime = DateTime.Now,
                    FromDevice = "Laptop/Desktop",
                    ChangeDetails = _context.ServiceCategorys.FirstOrDefault(x => !x.IsDeleted && x.ServiceCode == service.ServiceCode).ServiceName
                };
                _context.CardUserActivitys.Add(activity);

                _context.SaveChanges();
                msg.Title = _stringLocalizer["CJ_MSG_ADD_SERVICE_SUCCESS"];

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
        public JsonResult DeleteService(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var cardService = _context.JcServices.FirstOrDefault(x => x.ID == id);
                if (cardService != null)
                {
                    cardService.IsDeleted = true;
                    cardService.DeletedBy = ESEIM.AppContext.UserName;
                    cardService.DeletedTime = DateTime.Now;
                    _context.JcServices.Update(cardService);

                    var activity = new CardUserActivity
                    {
                        UserId = ESEIM.AppContext.UserId,
                        IdObject = "SER",
                        Action = "DELETE",
                        IsCheck = true,
                        CardCode = cardService.CardCode,
                        CreatedTime = DateTime.Now,
                        FromDevice = "Laptop/Desktop",
                        ChangeDetails = _context.ServiceCategorys.FirstOrDefault(x => !x.IsDeleted && x.ServiceCode == cardService.ServiceCode).ServiceName
                    };
                    _context.CardUserActivitys.Add(activity);

                    _context.SaveChanges();
                    msg.Title = _stringLocalizer["CJ_MSG_DELETE_SERVICE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["CJ_MSG_SERVICE_NOT_EXIST"];
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
        public JsonResult GetActivityService()
        {
            var data = _context.CommonSettings.Where(x => x.Group == "JC_ACTIVITY_SERVICE" && !x.IsDeleted).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return Json(data);
        }
        #endregion

        #region Notification
        [NonAction]
        public void SendPushNotification(IQueryable<CardMemberCustom> listUserId, string message, object data)
        {
            if (listUserId != null && listUserId.Any())
            {
                var query = (from a in listUserId
                             join b in _context.FcmTokens on a.UserId equals b.UserId
                             join c in _context.Users on a.UserId equals c.Id
                             where c.Active == true
                             select new DeviceFcm
                             {
                                 Token = b.Token,
                                 Device = b.Device
                             }).AsNoTracking().Select(y => new DeviceFcm { Token = y.Token, Device = y.Device });
                if (query.Any())
                {
                    var countToken = query.Count();
                    if (countToken > 100000)
                    {
                        int countPush = (query.Count() / 100000) + 1;
                        for (int i = 0; i < countPush; i++)
                        {
                            //var listDevices = query.Skip(i * 1000).Take(100000).AsNoTracking().ToList();
                            List<DeviceFcm> listDevices = query.Skip(i * 1000).Take(100000).AsNoTracking().ToList();

                            var sendNotication = _notification.SendNotification("Thông báo", message, listDevices, data);
                        }
                    }
                    else
                    {
                        var sendNotication = _notification.SendNotification("Thông báo", message, query.ToList(), data);
                    }
                }
            }
        }

        //[HttpPost]
        //public JsonResult SendNotification([FromBody]NotificationBatchModel obj)
        //{
        //    var msg = new JMessage();
        //    try
        //    {
        //        var card = _context.WORKOSCards.FirstOrDefault(x => x.CardCode == obj.CardCode && !x.IsDeleted);
        //        var list = _context.WORKOSLists.FirstOrDefault(x => x.ListCode == card.ListCode && !x.IsDeleted);
        //        var board = _context.WORKOSBoards.FirstOrDefault(x => x.BoardCode == list.BoardCode && !x.IsDeleted);
        //        var data = _context.CardMappings.Where(x => x.CardCode.Equals(obj.CardCode) && (!string.IsNullOrEmpty(x.TeamCode) || !string.IsNullOrEmpty(x.GroupUserCode))).Select(x => new
        //        {
        //            x.Id,
        //            Code = !string.IsNullOrEmpty(x.TeamCode) ? x.TeamCode : x.GroupUserCode,
        //            Name = string.IsNullOrEmpty(x.TeamCode) ? (_context.AdDepartments.FirstOrDefault(y => y.DepartmentCode == x.GroupUserCode).Title ?? "") : _context.AdGroupUsers.FirstOrDefault(y => y.GroupUserCode == x.TeamCode).Title,
        //            Type = !string.IsNullOrEmpty(x.TeamCode) ? 1 : 2,
        //            x.Responsibility
        //        });
        //        var lstUser = ((from a in data
        //                        join b in _context.AdUserInGroups on a.Code equals b.GroupUserCode
        //                        join c in _context.Users on b.UserId equals c.Id
        //                        where a.Type == 1
        //                        select new CardMemberCustom
        //                        {
        //                            Id = a.Id,
        //                            UserId = b.UserId,
        //                            Responsibility = a.Responsibility
        //                        }).Union(from a in data
        //                                 join b in _context.AdUserDepartments on a.Code equals b.DepartmentCode
        //                                 join c in _context.Users on b.UserId equals c.Id
        //                                 where a.Type == 2
        //                                 select new CardMemberCustom
        //                                 {
        //                                     Id = a.Id,
        //                                     UserId = b.UserId,
        //                                     Responsibility = a.Responsibility
        //                                 }).Union(from a in _context.CardMappings
        //                                          join b in _context.Users on a.UserId equals b.Id
        //                                          where a.CardCode == obj.CardCode
        //                                          select new CardMemberCustom
        //                                          {
        //                                              Id = a.Id,
        //                                              UserId = a.UserId,
        //                                              Responsibility = a.Responsibility
        //                                          })).DistinctBy(x => x.UserId);

        //        var notificationBatch = GetNotificationBatch();
        //        string message = "";
        //        if (notificationBatch == "NO")
        //        {
        //            message = string.Format("Thẻ việc [#{0}-{1}] mới được cập nhật", card.CardCode, card.CardName);
        //        }
        //        else
        //        {
        //            foreach (var item in obj.List)
        //            {
        //                switch (item.IdObject)
        //                {
        //                    case "FILE":
        //                        if (item.Action == "ADD")
        //                        {
        //                            message = "Thẻ việc {0} mới thêm tệp tin";
        //                        }
        //                        else
        //                        {
        //                            message = "Thẻ việc {0} mới xóa tệp tin";
        //                        }
        //                        break;
        //                    case "CMT":
        //                        if (item.Action == "ADD")
        //                        {
        //                            message = "Thẻ việc {0} mới thêm bình luận";
        //                        }
        //                        else if (item.Action == "UPDATE")
        //                        {
        //                            message = "Thẻ việc {0} mới cập nhật bình luận";
        //                        }
        //                        else
        //                        {
        //                            message = "Thẻ việc {0} mới xóa bình luận";
        //                        }
        //                        break;
        //                    case "ADDR":
        //                        if (item.Action == "ADD")
        //                        {
        //                            message = "Thẻ việc {0} mới thêm địa điểm làm việc";
        //                        }
        //                        else
        //                        {
        //                            message = "Thẻ việc {0} mới xóa địa điểm làm việc";
        //                        }
        //                        break;
        //                    case "PROD":
        //                        if (item.Action == "ADD")
        //                        {
        //                            message = "Thẻ việc {0} mới thêm sản phẩm";
        //                        }
        //                        else
        //                        {
        //                            message = "Thẻ việc {0} mới xóa sản phẩm";
        //                        }
        //                        break;
        //                    case "SER":
        //                        if (item.Action == "ADD")
        //                        {
        //                            message = "Thẻ việc {0} mới thêm dịch vụ";
        //                        }
        //                        else
        //                        {
        //                            message = "Thẻ việc {0} mới xóa dịch vụ";
        //                        }
        //                        break;
        //                    case "ITEMCHECK":
        //                        if (item.Action == "ADD")
        //                        {
        //                            message = "Thẻ việc {0} mới thêm đầu mục việc";
        //                        }
        //                        else if (item.Action == "UPDATE")
        //                        {
        //                            message = "Thẻ việc {0} mới cập nhật đầu mục việc";
        //                        }
        //                        else
        //                        {
        //                            message = "Thẻ việc {0} mới xóa đầu mục việc";
        //                        }
        //                        break;
        //                    case "SUBITEM":
        //                        if (item.Action == "ADD")
        //                        {
        //                            message = "Thẻ việc {0} mới thêm đầu mục việc con";
        //                        }
        //                        else if (item.Action == "UPDATE")
        //                        {
        //                            message = "Thẻ việc {0} mới cập nhật đầu mục việc con";
        //                        }
        //                        else
        //                        {
        //                            message = "Thẻ việc {0} mới xóa đầu mục việc con";
        //                        }
        //                        break;
        //                    case "ITEMWORK":
        //                        if (item.Action == "ADD")
        //                        {
        //                            message = "Thẻ việc {0} mới thêm báo tiến độ";
        //                        }
        //                        else if (item.Action == "UPDATE")
        //                        {
        //                            message = "Thẻ việc {0} mới cập nhật tiến độ";
        //                        }
        //                        else if (item.Action == "LEADER")
        //                        {
        //                            message = "Thẻ việc {0}, lãnh đạo đánh giá tiến độ";
        //                        }
        //                        else
        //                        {
        //                            message = "Thẻ việc {0} mới xóa tiến độ";
        //                        }
        //                        break;
        //                }
        //            }
        //        }

        //        SendPushNotification(lstUser.AsQueryable(), string.Format(message, card.CardName), new
        //        {
        //            board.BoardCode,
        //            board.BoardName,
        //            list.ListCode,
        //            card.CardCode,
        //            card.CardName,
        //            card.BeginTime,
        //            card.EndTime,
        //            card.CardID,
        //            card.CardLevel,
        //            card.Deadline,
        //            card.Currency,
        //            card.Completed,
        //            card.Cost,
        //            Type = board.BoardType == "BOARD_REPEAT" ? "REPEAT" : board.BoardType == "BOARD_PROJECT" ? "PROJECT" : "BUILDING",
        //            ProjectCode = "",
        //            ProjectName = "",
        //        });
        //        msg.Title = _stringLocalizer["CJ_MSG_SEND_NOTIFI_SUCCESS"];
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Title = _sharedResources["COM_MSG_ERR"];
        //    }
        //    return Json(msg);
        //}

        [HttpPost]
        public JsonResult SendNotification([FromBody] CardNotifi notifi)
        {
            var msg = new JMessage();
            try
            {
                var session = HttpContext.GetSessionUser();
                var card = _context.WORKOSCards.FirstOrDefault(x => x.CardCode == notifi.CardCode && !x.IsDeleted);
                var list = _context.WORKOSLists.FirstOrDefault(x => x.ListCode == card.ListCode && !x.IsDeleted);
                var board = _context.WORKOSBoards.FirstOrDefault(x => x.BoardCode == list.BoardCode && !x.IsDeleted);

                SendPushNotification(notifi.LstUser.AsQueryable(), string.Format("Thẻ #{0} được cập nhật bởi {1}", card.CardCode, session.FullName), new
                {
                    board.BoardCode,
                    board.BoardName,
                    list.ListCode,
                    card.CardCode,
                    card.CardName,
                    card.BeginTime,
                    card.EndTime,
                    card.CardID,
                    card.CardLevel,
                    card.Deadline,
                    card.Currency,
                    card.Completed,
                    card.Cost,
                    Type = board.BoardType == "BOARD_REPEAT" ? "REPEAT" : board.BoardType == "BOARD_PROJECT" ? "PROJECT" : "BUILDING",
                    ProjectCode = "",
                    ProjectName = "",
                });
                msg.Title = _stringLocalizer["CJ_MSG_SEND_NOTIFI_SUCCESS"];
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }
        public class CardNotifi
        {
            public string CardCode { get; set; }
            public List<CardMemberCustom> LstUser { get; set; }
        }
        [NonAction]
        public string GetNotificationBatch()
        {
            var notifBatch = _context.CommonSettings.FirstOrDefault(x => x.CodeSet == "NOTIFICATION_CARD"
            && x.Group == "NOTIFICATION" && x.AssetCode == "CARDJOB" && !x.IsDeleted).ValueSet;
            return notifBatch;
        }

        [HttpPost]
        public JsonResult UpdateListUserView(string cardCode)
        {
            var data = _context.WORKOSCards.FirstOrDefault(x => x.CardCode == cardCode && !x.IsDeleted);
            data.ListUserView = ESEIM.AppContext.UserId;
            _context.SaveChanges();
            return Json("");
        }
        [HttpPost]
        public JsonResult InsertListUserView(string cardCode)
        {
            var data = _context.WORKOSCards.FirstOrDefault(x => x.CardCode == cardCode && !x.IsDeleted);
            data.ListUserView = ";" + ESEIM.AppContext.UserId;
            _context.SaveChanges();
            return Json("");
        }
        public class NotificationBatch
        {
            public string IdObject { get; set; }
            public string Action { get; set; }
            public string UserAction { get; set; }
            public DateTime CreatedTime { get; set; }
        }
        public class NotificationBatchModel
        {
            public string CardCode { get; set; }
            public List<NotificationBatch> List { get; set; }
        }
        #endregion

        #region Assign
        [HttpPost]
        public object GetListRoleAssign()
        {

            var data = _context.CommonSettings.Where(x => x.Group == EnumHelper<CardEnum>.GetDisplayValue(CardEnum.Role)).OrderBy(x => x.Priority)
                .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return data;
        }

        [HttpPost]
        public JsonResult AssignGroupOrTeam([FromBody]CardGroupOrMemberModel data)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                IQueryable<CardMemberCustom> lstUser = null;
                var card = _context.WORKOSCards.FirstOrDefault(x => x.CardCode == data.CardCode);
                var attachments = _context.CardAttachments.Where(x => x.CardCode == data.CardCode && !x.Flag);

                var list = _context.WORKOSLists.FirstOrDefault(x => x.ListCode == card.ListCode);
                var board = _context.WORKOSBoards.FirstOrDefault(x => x.BoardCode == list.BoardCode);
                if (data.ListDeletedObj.Any())
                {
                    var listDeleted = _context.CardMappings.Where(x => data.ListDeletedObj.Any(y => x.Id == y));
                    if (listDeleted.Any())
                    {
                        _context.CardMappings.RemoveRange(listDeleted);

                        foreach(var item in listDeleted)
                        {
                            if (!string.IsNullOrEmpty(item.GroupUserCode))
                            {
                                var users = GetMemberInDepartment(item.GroupUserCode);
                                foreach(var k in users)
                                {
                                    foreach (var attach in attachments)
                                    {
                                        var listUserFile = !string.IsNullOrEmpty(attach.ListPermissionViewFile) ? attach.ListPermissionViewFile.Split(",", StringSplitOptions.None) : new string[0];
                                        var lstUserFile = new List<string>(listUserFile);
                                        foreach(var uFile in lstUserFile)
                                        {
                                            if (uFile == k.UserId)
                                            {
                                                lstUserFile.Remove(uFile);
                                                break;
                                            }
                                        }
                                        attach.ListPermissionViewFile = null;
                                        attach.ListPermissionViewFile = lstUserFile != null ? string.Join(",", lstUserFile) : null;
                                        _context.CardAttachments.Update(attach);
                                    }
                                }
                            }

                            if (!string.IsNullOrEmpty(item.TeamCode))
                            {
                                var users = GetMemberInGroup(item.TeamCode);
                                foreach (var k in users)
                                {
                                    foreach (var attach in attachments)
                                    {
                                        var listUserFile = !string.IsNullOrEmpty(attach.ListPermissionViewFile) ? attach.ListPermissionViewFile.Split(",", StringSplitOptions.None) : new string[0];
                                        var lstUserFile = new List<string>(listUserFile);
                                        foreach (var uFile in lstUserFile)
                                        {
                                            if (uFile == k.UserId)
                                            {
                                                lstUserFile.Remove(uFile);
                                                break;
                                            }
                                        }
                                        attach.ListPermissionViewFile = null;
                                        attach.ListPermissionViewFile = lstUserFile != null ? string.Join(",", lstUserFile) : null;
                                        _context.CardAttachments.Update(attach);
                                    }
                                }
                            }
                        }
                    }
                }
                if (data.ListObj.Any())
                {
                    foreach (var item in data.ListObj)
                    {
                        var listUserFile = new List<UserIdModel>();
                        if (item.Id > 0)
                        {
                            var member = _context.CardMappings.FirstOrDefault(x => x.Id == item.Id);
                            if (member != null)
                            {
                                member.Responsibility = item.Responsibility;
                                _context.CardMappings.Update(member);
                            }
                        }
                        else
                        {
                            var member = new CardMapping()
                            {
                                BoardCode = board.BoardCode,
                                ListCode = card.ListCode,
                                CardCode = data.CardCode,
                                TeamCode = item.Type == 1 ? item.Code : null,
                                GroupUserCode = item.Type == 2 ? item.Code : null,
                                //GroupUserCode = item.Type == 1 ? item.Code : null,
                                //TeamCode = item.Type == 2 ? item.Code : null,
                                Responsibility = item.Responsibility,
                                CreatedTime = DateTime.Now,
                                CreatedBy = ESEIM.AppContext.UserName,
                            };
                            _context.CardMappings.Add(member);
                            if (item.Type == 1)
                            {
                                listUserFile = GetMemberInGroup(item.Code);
                                if (listUserFile.Count() != 0)
                                {
                                    foreach (var user in listUserFile)
                                    {
                                        if (attachments.Count() > 0)
                                        {
                                            foreach (var itemFile in attachments)
                                            {
                                                itemFile.ListPermissionViewFile = itemFile.ListPermissionViewFile + "," + user.UserId;
                                                _context.CardAttachments.Update(itemFile);
                                            }
                                        }
                                    }
                                }
                            }

                            if (item.Type == 2)
                            {
                                listUserFile = GetMemberInDepartment(item.Code);
                                if (listUserFile.Count() != 0)
                                {
                                    foreach (var user in listUserFile)
                                    {
                                        if (attachments.Count() > 0)
                                        {
                                            foreach (var itemFile in attachments)
                                            {
                                                itemFile.ListPermissionViewFile = itemFile.ListPermissionViewFile + "," + user.UserId;
                                                _context.CardAttachments.Update(itemFile);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    //get all member in team
                    var listUserInTeam = from a in _context.Teams.Where(x => data.ListObj.Any(y => x.TeamCode == y.Code && y.Type == 1))
                                         select new
                                         {
                                             Members = string.Concat(a.Members, ",", a.Leader)
                                         };
                    foreach (var team in listUserInTeam)
                    {
                        var listUser = team.Members.Split(",").Select(x => new CardMemberCustom
                        {
                            UserId = x
                        });
                        lstUser = lstUser != null && lstUser.Any() ? lstUser.Concat(listUser) : listUser.AsQueryable();
                    }

                    //get all member in department
                    var listUserInDepartment = GetMemberInDepartment(data.ListObj.Where(x => x.Type == 2).Select(x => x.Code));
                    lstUser = lstUser != null && lstUser.Any() ? lstUser.Concat(listUserInDepartment) : listUserInDepartment;
                }

                //member
                if (data.ListDeleteMember.Any())
                {
                    var listDeletedMember = _context.CardMappings.Where(x => data.ListDeleteMember.Any(y => x.Id == y) && !string.IsNullOrEmpty(x.UserId));
                    if (listDeletedMember.Any())
                    {
                        _context.CardMappings.RemoveRange(listDeletedMember);

                        foreach(var item in listDeletedMember)
                        {
                            foreach (var attach in attachments)
                            {
                                var listUserFile = !string.IsNullOrEmpty(attach.ListPermissionViewFile) ? attach.ListPermissionViewFile.Split(",", StringSplitOptions.None) : new string[0];
                                var lstUserFile = new List<string>(listUserFile);
                                foreach (var uFile in lstUserFile)
                                {
                                    if (uFile == item.UserId)
                                    {
                                        lstUserFile.Remove(uFile);
                                        break;
                                    }
                                }
                                attach.ListPermissionViewFile = null;
                                attach.ListPermissionViewFile = lstUserFile != null ? string.Join(",", lstUserFile) : null;
                                _context.CardAttachments.Update(attach);
                            }
                        }
                    }
                }
                if (data.ListMember.Any())
                {
                    foreach (var item in data.ListMember)
                    {
                        if (item.Responsibility != "" && item.Responsibility != null)
                        {
                            if (item.Id > 0)
                            {
                                var member = _context.CardMappings.FirstOrDefault(x => x.Id == item.Id);
                                if (member != null)
                                {
                                    member.Responsibility = item.Responsibility;
                                    _context.CardMappings.Update(member);
                                }
                            }
                            else
                            {
                                var member = new CardMapping()
                                {
                                    BoardCode = board.BoardCode,
                                    ListCode = card.ListCode,
                                    CardCode = data.CardCode,
                                    UserId = item.UserId,
                                    Responsibility = item.Responsibility,
                                    CreatedTime = DateTime.Now,
                                    CreatedBy = ESEIM.AppContext.UserName,
                                };
                                _context.CardMappings.Add(member);

                                if (attachments.Count() > 0)
                                {
                                    foreach (var itemFile in attachments)
                                    {
                                        itemFile.ListPermissionViewFile = itemFile.ListPermissionViewFile + "," + item.UserId;
                                        _context.CardAttachments.Update(itemFile);
                                    }
                                }

                                var notifcation = new NotificationObject
                                {
                                    ObjType = "CARD",
                                    ObjCode = card.CardCode,
                                    IsViewed = false,
                                    CreatedBy = ESEIM.AppContext.UserName,
                                    CreatedTime = DateTime.Now,
                                    ListUser = item.UserId
                                };
                                _context.NotificationObjects.Add(notifcation);
                            }
                        }

                    }
                    lstUser = lstUser != null && lstUser.Any() ? lstUser.Concat(data.ListMember) : data.ListMember.AsQueryable();
                }
                card.LstUser = lstUser != null && lstUser.Any() ? string.Join(",", lstUser.Select(x => x.UserId)) : null;
                _context.SaveChanges();
                msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["CJ_CURD_TAB_ADD_MEMBER"]);//"Thêm thành viên thành công!";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                // msg.Title = String.Format(_stringLocalize["COM_MSG_ADD_FAILED"), _stringLocalize["CJ_CURD_TAB_ADD_MEMBER")); ;//"Có lỗi khi thêm thành viên!";
            }
            return Json(msg);
        }

        [NonAction]
        public List<UserIdModel> GetMemberInDepartment(string departmentCode)
        {
            var listUserInDepartment = from a in _context.AdDepartments.Where(x => x.DepartmentCode == departmentCode)
                                       join b in _context.Users on a.DepartmentCode equals b.DepartmentId
                                       select new UserIdModel
                                       {
                                           UserId = b.Id,
                                       };
            return listUserInDepartment.ToList();
        }
        [NonAction]
        public List<UserIdModel> GetMemberInGroup(string groupCode)
        {
            var listUserInGroup = from a in _context.AdUserInGroups.Where(x => x.GroupUserCode == groupCode && !x.IsDeleted)
                                  select new UserIdModel
                                  {
                                      UserId = a.UserId,
                                  };
            return listUserInGroup.ToList();
        }

        [HttpPost]
        public JsonResult GetMemberAssign(string CardCode)
        {
            //var role = RoleInCardOfUser(CardCode);
            var query = (from a in _context.CardMappings
                         join b in _context.Users on a.UserId equals b.Id
                         where a.CardCode == CardCode
                         select new
                         {
                             a.Id,
                             a.UserId,
                             b.GivenName,
                             a.CreatedTime,
                             a.Responsibility,
                             b.DepartmentId
                         });
            return Json(query);
        }

        [HttpPost]
        public object RoleInCardOfUser(string cardCode)
        {
            var data = _context.CardMappings.Where(x => x.CardCode.Equals(cardCode) && (!string.IsNullOrEmpty(x.TeamCode) || !string.IsNullOrEmpty(x.GroupUserCode))).Select(x => new
            {
                x.Id,
                Code = !string.IsNullOrEmpty(x.TeamCode) ? x.TeamCode : x.GroupUserCode,
                Name = string.IsNullOrEmpty(x.TeamCode) ? (_context.AdDepartments.FirstOrDefault(y => y.DepartmentCode == x.GroupUserCode).Title ?? "") : _context.AdGroupUsers.FirstOrDefault(y => y.GroupUserCode == x.TeamCode).Title,
                Type = !string.IsNullOrEmpty(x.TeamCode) ? 1 : 2,
                x.Responsibility
            });
            var listUsers = ((from a in data
                              join b in _context.AdUserInGroups on a.Code equals b.GroupUserCode
                              join c in _context.Users on b.UserId equals c.Id
                              where a.Type == 1
                              select new RoleInCard
                              {
                                  Id = a.Id,
                                  UserId = b.UserId,
                                  Responsibility = "ROLE_STAFF",
                                  DepartmentId = c.DepartmentId
                              }).Union(from a in data
                                       join c in _context.Users on a.Code equals c.DepartmentId
                                       where a.Type == 2
                                       select new RoleInCard
                                       {
                                           Id = a.Id,
                                           UserId = c.Id,
                                           Responsibility = "ROLE_STAFF",
                                           DepartmentId = c.DepartmentId
                                       }).Union(from a in _context.CardMappings
                                                join b in _context.Users on a.UserId equals b.Id
                                                where a.CardCode == cardCode
                                                select new RoleInCard
                                                {
                                                    Id = a.Id,
                                                    UserId = a.UserId,
                                                    Responsibility = a.Responsibility,
                                                    DepartmentId = b.DepartmentId
                                                }));
            var session = HttpContext.GetSessionUser();
            if (session.IsAllData)
            {
                var role = new RoleInCard
                {
                    Id = 0,
                    DepartmentId = "",
                    Responsibility = "ROLE_LEADER",
                    UserId = session.UserId,
                    Priority = 0
                };
                return role;
            }
            else
            {
                if (listUsers.Any())
                {

                    var list = new List<RoleInCard>();
                    foreach (var item in listUsers)
                    {
                        if (item.UserId == session.UserId)
                        {
                            list.Add(item);
                        }
                    }
                    if (list.Count() > 0)
                    {
                        var getResponsibility = (from a in list
                                                 join b in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "CARD_ROLE") on a.Responsibility equals b.CodeSet
                                                 select new RoleInCard
                                                 {
                                                     Id = a.Id,
                                                     DepartmentId = a.DepartmentId,
                                                     Responsibility = a.Responsibility,
                                                     UserId = a.UserId,
                                                     Priority = b.Priority
                                                 }).OrderBy(x => x.Priority);
                        var role = getResponsibility.FirstOrDefault();
                        return role;
                    }
                    else
                    {
                        var card = _context.WORKOSCards.FirstOrDefault(x => !x.IsDeleted && x.CardCode == cardCode);
                        if (card.CreatedBy == session.UserName)
                        {
                            var role = new RoleInCard
                            {
                                Id = 0,
                                DepartmentId = "",
                                Responsibility = "ROLE_LEADER",
                                UserId = session.UserId,
                                Priority = 0
                            };
                            return role;
                        }
                        else
                        {
                            var role = new RoleInCard
                            {
                                Id = 0,
                                DepartmentId = "",
                                Responsibility = "ROLE_STAFF",
                                UserId = session.UserId,
                                Priority = 0
                            };
                            return role;
                        }
                    }
                }
                else
                {
                    var role = new RoleInCard
                    {
                        Id = 0,
                        DepartmentId = "",
                        Responsibility = "ROLE_LEADER",
                        UserId = session.UserId,
                        Priority = 0
                    };
                    return role;
                }
            }
        }

        public class UserIdModel
        {
            public string UserId { get; set; }
        }
        public class RoleInCard
        {
            public int Id { get; set; }
            public string UserId { get; set; }
            public string Responsibility { get; set; }
            public string DepartmentId { get; set; }
            public int? Priority { get; set; }
        }
        [HttpPost]
        public JsonResult GetTeamAndGroupUserAssign(string CardCode)
        {
            var data = _context.CardMappings.Where(x => x.CardCode.Equals(CardCode) && (!string.IsNullOrEmpty(x.TeamCode) || !string.IsNullOrEmpty(x.GroupUserCode))).Select(x => new
            {
                x.Id,
                Code = !string.IsNullOrEmpty(x.TeamCode) ? x.TeamCode : x.GroupUserCode,
                Name = string.IsNullOrEmpty(x.TeamCode) ? (_context.AdDepartments.FirstOrDefault(y => y.DepartmentCode == x.GroupUserCode).Title ?? "") : _context.AdGroupUsers.FirstOrDefault(y => y.GroupUserCode == x.TeamCode).Title,
                Type = !string.IsNullOrEmpty(x.TeamCode) ? 1 : 2,
                x.Responsibility
            });
            return Json(data);
        }

        [HttpGet]
        public object GetActivityAssign(string cardCode)
        {
            var query = (from a in _context.CardUserActivitys
                         join b in _context.Users on a.UserId equals b.Id
                         where a.CardCode == cardCode
                         select new
                         {
                             a.Id,
                             a.UserId,
                             b.GivenName,
                             b.Picture,
                             a.Action,
                             a.IdObject,
                             CreatedTime = a.CreatedTime.ToString("dd/MM/yyyy HH:mm:ss"),
                             a.IsCheck,
                             a.ChangeDetails
                         }).OrderByDescending(x => x.Id);
            return Json(query);
        }

        [HttpGet]
        public object LogActivityUser(string cardCode)
        {
            var userId = ESEIM.AppContext.UserId;
            var activityExceptUser = (from a in _context.CardUserActivitys
                                      join b in _context.Users on a.UserId equals b.Id
                                      where a.CardCode == cardCode && (a.Action == "REVIEW" || a.Action == "REJECT" || a.Action == "ACCEPT")
                                      && a.UserId != userId
                                      select new
                                      {
                                          a.Id,
                                          a.UserId,
                                          b.GivenName,
                                          b.Picture,
                                          a.Action,
                                          a.IdObject,
                                          CreatedTime = a.CreatedTime.ToString("dd/MM/yyyy HH:mm:ss"),
                                          a.IsCheck,
                                          a.ChangeDetails
                                      }).OrderByDescending(x => x.Id);
            var activityCurrentUser = (from a in _context.CardUserActivitys
                                       join b in _context.Users on a.UserId equals b.Id
                                       where a.CardCode == cardCode && (a.Action == "REVIEW" || a.Action == "REJECT" || a.Action == "ACCEPT")
                                       && a.UserId == userId
                                       select new
                                       {
                                           a.Id,
                                           a.UserId,
                                           b.GivenName,
                                           b.Picture,
                                           a.Action,
                                           a.IdObject,
                                           CreatedTime = a.CreatedTime.ToString("dd/MM/yyyy HH:mm:ss"),
                                           a.IsCheck,
                                           a.ChangeDetails
                                       }).OrderByDescending(x => x.Id);
            var query = activityCurrentUser.Concat(activityExceptUser);

            var allActivity = (from a in _context.CardUserActivitys
                               join b in _context.Users on a.UserId equals b.Id
                               where a.CardCode == cardCode && (a.Action == "REVIEW" || a.Action == "REJECT" || a.Action == "ACCEPT")
                               select new
                               {
                                   a.Id,
                                   a.UserId,
                                   b.GivenName,
                                   b.Picture,
                                   a.Action,
                                   a.IdObject,
                                   CreatedTime = a.CreatedTime.ToString("dd/MM/yyyy HH:mm:ss"),
                                   a.IsCheck,
                                   a.ChangeDetails
                               }).DistinctBy(x => new { x.Action, x.UserId });


            var countView = allActivity.Where(x => x.Action == "REVIEW");
            var countReject = allActivity.Where(x => x.Action == "REJECT");
            var countAccept = allActivity.Where(x => x.Action == "ACCEPT");
            return new
            {
                Log = query,
                CountView = countView.Count(),
                CountReject = countReject.Count(),
                CountAccept = countAccept.Count(),
            };
        }

        [HttpPost]
        public JsonResult GetMemberInCardJob(string cardCode)
        {
            var data = _context.CardMappings.Where(x => x.CardCode.Equals(cardCode) && (!string.IsNullOrEmpty(x.TeamCode) || !string.IsNullOrEmpty(x.GroupUserCode))).Select(x => new
            {
                x.Id,
                Code = !string.IsNullOrEmpty(x.TeamCode) ? x.TeamCode : x.GroupUserCode,
                Name = string.IsNullOrEmpty(x.TeamCode) ? (_context.AdDepartments.FirstOrDefault(y => y.DepartmentCode == x.GroupUserCode).Title ?? "") : _context.AdGroupUsers.FirstOrDefault(y => y.GroupUserCode == x.TeamCode).Title,
                Type = !string.IsNullOrEmpty(x.TeamCode) ? 1 : 2,
                x.Responsibility
            });
            var listUsers = ((from a in data
                              join b in _context.AdUserInGroups on a.Code equals b.GroupUserCode
                              join c in _context.Users on b.UserId equals c.Id
                              where a.Type == 1
                              select new
                              {
                                  a.Id,
                                  b.UserId,
                                  c.GivenName,
                                  a.Responsibility
                              }).Union(from a in data
                                       join c in _context.Users on a.Code equals c.DepartmentId
                                       where a.Type == 2
                                       select new
                                       {
                                           a.Id,
                                           UserId = c.Id,
                                           c.GivenName,
                                           a.Responsibility
                                       }).Union(from a in _context.CardMappings
                                                join b in _context.Users on a.UserId equals b.Id
                                                where a.CardCode == cardCode
                                                select new
                                                {
                                                    a.Id,
                                                    a.UserId,
                                                    b.GivenName,
                                                    a.Responsibility
                                                })).DistinctBy(x => x.UserId);
            return Json(listUsers);
        }

        [HttpPost]
        public JsonResult GetUserInItemWork([FromBody]JobCardUserItemMember obj)
        {
            var data = from a in _context.WorkItemAssignStaffs
                       join b in _context.Users on a.UserId equals b.Id
                       where !a.IsDeleted && a.CardCode.Equals(obj.CardCode) && a.CheckListCode.Equals(obj.CheckListCode)
                       select new
                       {
                           a.UserId,
                           b.GivenName
                       };
            return Json(data);
        }

        [HttpPost]
        public JsonResult InsertJobCardUser([FromBody]WorkItemAssignStaff obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.WorkItemAssignStaffs.FirstOrDefault(x => x.UserId.Equals(obj.UserId) && x.CardCode.Equals(obj.CardCode) && !x.IsDeleted && x.CheckListCode.Equals(obj.CheckListCode));
                if (data == null)
                {
                    var jobCardUser = new WorkItemAssignStaff
                    {
                        CardCode = obj.CardCode,
                        UserId = obj.UserId,
                        CheckItem = obj.CheckItem,
                        CheckListCode = obj.CheckListCode,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now,
                        EstimateTime = obj.EstimateTime,
                        Unit = obj.Unit
                    };

                    _context.WorkItemAssignStaffs.Add(jobCardUser);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["CJ_MSG_MEMBER_ADDED_ITEM"];
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
        public JsonResult GetJobCardUser([FromBody] JobCardUserItemMember obj)
        {
            var data = from a in _context.WorkItemAssignStaffs
                       join b in _context.Users on a.UserId equals b.Id
                       where a.CheckListCode.Equals(obj.CheckListCode) && a.CardCode.Equals(obj.CardCode) && !a.IsDeleted && a.CheckItem == ""
                       select new
                       {
                           a.ID,
                           a.UserId,
                           b.GivenName,
                           a.EstimateTime,
                           Status = _context.CommonSettings.FirstOrDefault(x => x.CodeSet == a.Unit && !x.IsDeleted).ValueSet
                       };
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetJobCardSubItemUser([FromBody] JobCardUserSubItemMember obj)
        {
            var data = (from a in _context.WorkItemAssignStaffs
                        join b in _context.Users on a.UserId equals b.Id
                        where a.CheckListCode.Equals(obj.CheckListCode) && a.CardCode.Equals(obj.CardCode) && !a.IsDeleted && a.CheckItem.Equals(obj.CheckItem)
                        select new
                        {
                            a.ID,
                            a.UserId,
                            b.GivenName,
                            a.EstimateTime,
                            Status = _context.CommonSettings.FirstOrDefault(x => x.CodeSet == a.Unit && !x.IsDeleted).ValueSet
                        }).DistinctBy(x => x.UserId);
            return Json(data);
        }
        [HttpPost]
        public JsonResult InsertUserToSubItem([FromBody]WorkItemAssignStaff obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.WorkItemAssignStaffs.FirstOrDefault(x => x.UserId.Equals(obj.UserId) && x.CardCode.Equals(obj.CardCode) && !x.IsDeleted && x.CheckListCode.Equals(obj.CheckListCode) && x.CheckItem.Equals(obj.CheckItem));
                if (data == null)
                {
                    var jobCardUser = new WorkItemAssignStaff
                    {
                        CardCode = obj.CardCode,
                        UserId = obj.UserId,
                        CheckItem = obj.CheckItem,
                        CheckListCode = obj.CheckListCode,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now,
                        EstimateTime = obj.EstimateTime,
                        Unit = obj.Unit
                    };

                    _context.WorkItemAssignStaffs.Add(jobCardUser);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["CJ_MSG_MEMBER_EXISTED"];
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
        public JsonResult DeleteJobCardUser(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var data = _context.WorkItemAssignStaffs.FirstOrDefault(x => x.ID == id);
            if (data != null)
            {
                var isEmpInSubItem = _context.WorkItemAssignStaffs.Where(x => x.CardCode == data.CardCode && x.CheckItem != "" && x.CheckListCode == data.CheckListCode && x.UserId == data.UserId && !x.IsDeleted).ToList();
                if (data.CheckItem != "")
                {
                    data.IsDeleted = true;
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    _context.WorkItemAssignStaffs.Update(data);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
                }
                else if (data.CheckItem == "" && isEmpInSubItem.Count == 0)
                {
                    data.IsDeleted = true;
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    _context.WorkItemAssignStaffs.Update(data);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["CJ_MSG_MEMBER_ADDED_ITEM"];
                }

            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetUnitAssignStaff()
        {
            var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "UNIT_ASSIGN_STAFF").Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return Json(data);
        }
        #endregion

        #region WorkItemActivity
        [HttpPost]
        public JsonResult AutoGenerateWorkSession()
        {
            var workSession = "*" + (_context.WORKItemSessions.Count() > 0 ? _context.WORKItemSessions.Max(x => x.Id) + 1 : 1);
            return Json(workSession);
        }

        [HttpPost]
        public JsonResult GetCardItemCheck(string cardCode)
        {
            var data = _context.CardItemChecks.Where(x => x.CardCode.Equals(cardCode) && !x.Flag).Select(x => new { Code = x.ChkListCode, Text = x.CheckTitle });
            return Json(data);
        }

        [HttpPost]
        public JsonResult InsertWorkItem([FromBody] ItemWork item)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var session = HttpContext.GetSessionUser();
            try
            {
                DateTime? startTime = !string.IsNullOrEmpty(item.StartTime) ? DateTime.ParseExact(item.StartTime, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture) : (DateTime?)null;
                DateTime? endTime = !string.IsNullOrEmpty(item.EndTime) ? DateTime.ParseExact(item.EndTime, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture) : (DateTime?)null;
                var staffItemWork = _context.WORKItemSessions.FirstOrDefault(x => x.WorkSession.Equals(item.WorkSession));
                if (staffItemWork == null)
                {
                    var sessionItemChkItem = new SessionItemChkItem
                    {
                        Session = item.WorkSession,
                        ItemType = "1",
                        Item = item.ChkListCode,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now
                    };
                    _context.SessionItemChkItems.Add(sessionItemChkItem);

                    var itemStaff = new WORKItemSession
                    {
                        WorkSession = item.WorkSession,
                        CardCode = item.CardCode,
                        CreatedBy = ESEIM.AppContext.UserName,
                        Progress = item.ProgressFromLeader,
                        CreatedTime = DateTime.Now,
                        ShiftCode = item.ShiftCode,
                        ItemWorkList = item.ChkListCode
                    };
                    _context.WORKItemSessions.Add(itemStaff);

                    var itemActivity = new WORKItemSessionResult
                    {
                        WorkSession = item.WorkSession,
                        StartTime = startTime,
                        EndTime = endTime,
                        ProgressFromStaff = item.ProgressFromStaff,
                        ProgressFromLeader = item.ProgressFromLeader,
                        NoteFromLeader = item.NoteFromLeader,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now,
                        ShiftCode = item.ShiftCode
                    };
                    _context.WORKItemSessionResults.Add(itemActivity);

                    var cardItem = _context.CardItemChecks.FirstOrDefault(x => x.ChkListCode == item.ChkListCode && !x.Flag);
                    var activity = new CardUserActivity
                    {
                        UserId = ESEIM.AppContext.UserId,
                        Action = "ADD",
                        IdObject = "ITEMWORK",
                        IsCheck = true,
                        CardCode = item.CardCode,
                        CreatedTime = DateTime.Now,
                        FromDevice = "Laptop/Desktop",
                        ChangeDetails = "Cho đầu mục việc " + cardItem.CheckTitle
                    };
                    _context.CardUserActivitys.Add(activity);

                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_ADD_SUCCESS"];
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
        public JsonResult UpdateWorkItem([FromBody] ItemWork item)
        {
            var msg = new JMessage();
            try
            {
                if (item.ProgressFromLeader > 100)
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["CJ_MSG_PLS_ENTER_PROGRESS_LESS_THAN_100"];
                    return Json(msg);
                }
                DateTime? startTime = !string.IsNullOrEmpty(item.StartTime) ? DateTime.ParseExact(item.StartTime, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture) : (DateTime?)null;
                DateTime? endTime = !string.IsNullOrEmpty(item.EndTime) ? DateTime.ParseExact(item.EndTime, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture) : (DateTime?)null;
                var workResult = _context.WORKItemSessionResults.FirstOrDefault(x => !x.IsDeleted && x.WorkSession == item.WorkSession);
                var workSession = _context.WORKItemSessions.FirstOrDefault(x => !x.IsDeleted && x.WorkSession == item.WorkSession);

                if (workResult != null && workSession != null)
                {
                    workSession.ShiftCode = item.ShiftCode;
                    workSession.UpdatedBy = ESEIM.AppContext.UserName;
                    workSession.UpdatedTime = DateTime.Now;
                    _context.WORKItemSessions.Update(workSession);

                    workResult.StartTime = startTime;
                    workResult.EndTime = endTime;
                    workResult.ProgressFromLeader = item.ProgressFromLeader;
                    workResult.UserAssessor = item.UserLeader;
                    workResult.ProgressFromStaff = item.ProgressFromStaff;
                    workResult.NoteFromLeader = item.NoteFromLeader;
                    workResult.ShiftCode = item.ShiftCode;
                    workResult.UpdatedBy = ESEIM.AppContext.UserName;
                    workResult.UpdatedTime = DateTime.Now;
                    _context.WORKItemSessionResults.Update(workResult);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                }
            }
            catch (Exception ex)
            {
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Error = true;
            }
            return Json(msg);
        }


        [HttpPost]
        public JsonResult UpdateAutoShiftCodeWorkItem(string shiftCodeNew, string shiftCode)
        {
            var msg = new JMessage();
            try
            {
                var workResults = _context.WORKItemSessionResults.Where(x => !x.IsDeleted && x.ShiftCode == shiftCode);
                var workSessions = _context.WORKItemSessions.Where(x => !x.IsDeleted && x.ShiftCode == shiftCode);
                foreach (var workResult in workResults)
                {
                    workResult.ShiftCode = shiftCodeNew;
                    workResult.UpdatedBy = ESEIM.AppContext.UserName;
                    workResult.UpdatedTime = DateTime.Now;
                    _context.WORKItemSessionResults.Update(workResult);
                }
                foreach (var workSession in workSessions)
                {
                    workSession.ShiftCode = shiftCodeNew;
                    workSession.UpdatedBy = ESEIM.AppContext.UserName;
                    workSession.UpdatedTime = DateTime.Now;
                    _context.WORKItemSessions.Update(workSession);
                }
                _context.SaveChanges();
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public object GetShift(string shiftCode)
        {
            var data = _context.ShiftLogs.FirstOrDefault(x => x.ShiftCode == shiftCode);
            var shift = new ShiftLogManual
            {
                ShiftCode = data.ShiftCode,
                ChkinTime = data.ChkinTime,
                ChkinLocationTxt = data.ChkinLocationTxt,
                ChkoutTime = data.ChkoutTime,
                ChkoutLocationTxt = data.ChkoutLocationTxt,
                ChkinPicRealtime = data.ChkinPicRealtime,
                ChkoutPicRealtime = data.ChkoutPicRealtime,
                Note = data.Note,
                IsChkinRealtime = data.IsChkinRealtime
            };
            return shift;
        }

        [HttpPost]
        public JsonResult DeleteWorkItemActivity(int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            var session = HttpContext.GetSessionUser();
            if (CheckInOut(session.UserName) == true)
            {
                try
                {
                    var data = _context.WORKItemSessionResults.FirstOrDefault(x => !x.IsDeleted && x.Id == id);
                    var progress = data.ProgressFromLeader != 0 ? data.ProgressFromLeader : 0;
                    if (data != null)
                    {
                        if (data.CreatedBy == ESEIM.AppContext.UserName)
                        {
                            if (progress == 0)
                            {
                                data.IsDeleted = true;
                                data.DeletedBy = ESEIM.AppContext.UserName;
                                data.DeletedTime = DateTime.Now;
                                _context.WORKItemSessionResults.Update(data);

                                var data1 = _context.WORKItemSessions.FirstOrDefault(x => x.WorkSession == data.WorkSession && !x.IsDeleted);
                                var activity = new CardUserActivity
                                {
                                    UserId = ESEIM.AppContext.UserId,
                                    Action = "DELETE",
                                    IdObject = "ITEMWORK",
                                    IsCheck = true,
                                    CardCode = data1.CardCode,
                                    CreatedTime = DateTime.Now,
                                    FromDevice = "Laptop/Desktop"
                                };
                                _context.CardUserActivitys.Add(activity);

                                _context.SaveChanges();
                                msg.Title = _stringLocalizer["CJ_MSG_DELETE_DATA_SUCCESS"];
                            }
                            else
                            {
                                msg.Error = true;
                                msg.Title = _stringLocalizer["CJ_MSG_LEADER_EXAM_NOT_DEL"];
                            }
                        }
                        else
                        {
                            msg.Error = true;
                            msg.Title = _stringLocalizer["CJ_MSG_CANNOT_DELETE"];
                        }
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["CJ_MSG_NOT_FOUND_RECORD"];
                    }

                }
                catch (Exception ex)
                {
                    msg.Error = true;
                    msg.Object = ex;
                    msg.Title = _sharedResources["COM_MSG_ERR"];
                }
            }
            else
            {
                msg.Error = true;
                msg.Title = _stringLocalizer["CJ_MSG_CHECKIN_TO_WORK"];
            }

            return Json(msg);
        }
        [HttpPost]
        public JsonResult GetListWorkItem(string CardCode)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var list = (from a in _context.WORKItemSessions
                            join b in _context.ShiftLogs on a.ShiftCode equals b.ShiftCode
                            where !a.IsDeleted && a.CardCode.Equals(CardCode)
                            select new ViewItem
                            {
                                Id = a.Id,
                                WorkSession = a.WorkSession,
                                ItemWorkList = _context.SessionItemChkItems.Where(x => !x.IsDeleted && x.Session == a.WorkSession).ToList(),
                                Note = a.Note,
                                Status = a.Status,
                                Progress = a.Progress,
                                UserName = _context.Users.FirstOrDefault(x => x.UserName.Equals(a.CreatedBy)).GivenName,
                                CheckItem = false,
                                TimeCheckIn = b.ChkinTime.Value,
                                Value = "",
                                listItemActivity = (from c in _context.WORKItemSessionResults
                                                    join d in _context.SessionItemChkItems on c.WorkSession equals d.Session
                                                    join e in _context.CardItemChecks on d.Item equals e.ChkListCode
                                                    where c.WorkSession.Equals(a.WorkSession) && !c.IsDeleted
                                                    select new WorkSessionResultTemp
                                                    {
                                                        Id = c.Id,
                                                        StartTime = c.StartTime,
                                                        EndTime = c.EndTime,
                                                        ProgressFromLeader = c.ProgressFromLeader,
                                                        ProgressFromStaff = c.ProgressFromStaff,
                                                        CheckTitle = e.CheckTitle
                                                    }).DistinctBy(x => x.Id).ToList(),
                            }).ToList();
                foreach (var item in list)
                {
                    string value = "";
                    foreach (var i in item.ItemWorkList)
                    {
                        var CheckTitle = _context.CardItemChecks.FirstOrDefault(x => !x.Flag && x.ChkListCode == i.Item);
                        if (CheckTitle != null)
                        {
                            value += CheckTitle.CheckTitle + ", ";
                        }
                    }
                    item.Value = value;
                }
                msg.Object = list.DistinctBy(x => x.WorkSession);
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
        public object GetItemWork(int id)
        {
            var data = (from a in _context.WORKItemSessionResults.Where(x => !x.IsDeleted && x.Id == id)
                        join b in _context.WORKItemSessions.Where(x => !x.IsDeleted) on a.WorkSession equals b.WorkSession
                        select new
                        {
                            a.WorkSession,
                            ChkListCode = b.ItemWorkList,
                            StartTime = a.StartTime,
                            EndTime = a.EndTime,
                            a.ProgressFromLeader,
                            a.ProgressFromStaff,
                            a.ShiftCode,
                            a.NoteFromLeader,
                            a.CreatedBy
                        }).FirstOrDefault();
            return data;
        }

        [NonAction]
        public bool CheckInOut(string userName)
        {
            var data = _context.ShiftLogs.LastOrDefault(x => x.CreatedBy == userName);
            if (data != null)
            {
                if (data.ChkinTime.HasValue && data.ChkoutTime.HasValue)
                {
                    return false;
                }
                else
                {
                    return true;
                }
            }
            else
            {
                return false;
            }
        }
        [NonAction]
        public string GetShiftCode(string userName)
        {
            string shifCode = "";
            var shiftLog = _context.ShiftLogs.LastOrDefault(x => x.CreatedBy == userName);
            if (shiftLog != null)
            {
                if (shiftLog.ChkinTime.HasValue)
                    shifCode = shiftLog.ShiftCode;
            }
            return shifCode;
        }

        [HttpPost]
        public JsonResult UpdateProgressFromLeader([FromBody]WORKItemSessionResult item)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var data = _context.WORKItemSessionResults.FirstOrDefault(x => x.Id == item.Id && !x.IsDeleted);

            var progress = _context.WORKItemSessions.FirstOrDefault(x => x.WorkSession == data.WorkSession && !x.IsDeleted);

            var data1 = _context.WORKItemSessionResults.Where(x => x.WorkSession == data.WorkSession && !x.IsDeleted).ToList();
            decimal sum = 0;
            foreach (var i in data1)
            {
                sum += i.ProgressFromLeader;
            }
            sum = sum - data.ProgressFromLeader;
            if (item.ProgressFromLeader <= (100 - sum))
            {
                if (data != null)
                {
                    data.ProgressFromLeader = item.ProgressFromLeader;
                    data.UpdatedBy = ESEIM.AppContext.UserName;
                    data.UpdatedTime = DateTime.Now;

                    progress.Progress = sum + data.ProgressFromLeader;
                    progress.UpdatedBy = ESEIM.AppContext.UserName;
                    progress.UpdatedTime = DateTime.Now;
                    _context.WORKItemSessions.Update(progress);
                    _context.WORKItemSessionResults.Update(data);

                    var activity = new CardUserActivity
                    {
                        UserId = ESEIM.AppContext.UserId,
                        Action = "LEADER",
                        IdObject = "ITEMWORK",
                        IsCheck = true,
                        CardCode = progress.CardCode,
                        CreatedTime = DateTime.Now,
                        FromDevice = "Laptop/Desktop"
                    };
                    _context.CardUserActivitys.Add(activity);

                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["CJ_MSG_NOT_FOUND_RECORD"];
                }
            }
            else
            {
                msg.Error = true;
                msg.Title = _stringLocalizer["CJ_MSG_VALIDATE_PROGRESS"] + (100 - sum);
            }

            return Json(msg);
        }
        [HttpPost]
        public bool CheckRoleInCard(string cardCode)
        {
            var user = ESEIM.AppContext.UserId;
            var data = _context.CardMappings.FirstOrDefault(x => x.CardCode == cardCode && x.UserId == user);
            if (data != null)
            {
                if (data.Responsibility == "ROLE_LEADER")
                {
                    return true;
                }
            }
            return false;
        }
        [HttpPost]
        public JsonResult UpdateItemWork([FromBody] ItemWork item)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var userName = ESEIM.AppContext.UserName;
            //if (CheckInOut(userName) == true)
            //{
            try
            {
                DateTime? startTime = !string.IsNullOrEmpty(item.StartTime) ? DateTime.ParseExact(item.StartTime, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture) : (DateTime?)null;
                DateTime? endTime = !string.IsNullOrEmpty(item.EndTime) ? DateTime.ParseExact(item.EndTime, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture) : (DateTime?)null;
                var staffItemWork = _context.WORKItemSessions.FirstOrDefault(x => x.WorkSession.Equals(item.WorkSession) && !x.IsDeleted);
                if (staffItemWork != null)
                {
                    var shiftCode = GetShiftCode(userName);
                    var checkItemWorkByShift = _context.WORKItemSessionResults.Any(x => !x.IsDeleted && x.WorkSession.Equals(item.WorkSession) && x.ShiftCode.Equals(shiftCode) && x.CreatedBy.Equals(userName));
                    if (checkItemWorkByShift)
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["CJ_MSG_SHIFT_EXIST_RPT"];
                    }
                    else
                    {
                        var itemActivity = new WORKItemSessionResult
                        {
                            WorkSession = item.WorkSession,
                            StartTime = startTime,
                            EndTime = endTime,
                            ProgressFromStaff = item.ProgressFromStaff,
                            ProgressFromLeader = item.ProgressFromLeader,
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now,
                            ShiftCode = GetShiftCode(userName)
                            //ShiftCode = item.ShiftCode
                        };
                        _context.WORKItemSessionResults.Add(itemActivity);
                        staffItemWork.UpdatedBy = ESEIM.AppContext.UserName;
                        staffItemWork.UpdatedTime = DateTime.Now;
                        staffItemWork.ShiftCode = shiftCode;
                        //staffItemWork.ShiftCode = item.ShiftCode;
                        _context.WORKItemSessions.Update(staffItemWork);
                        _context.SaveChanges();
                        msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            //}
            //else
            //{
            //    msg.Error = true;
            //    msg.Title = _stringLocalizer["CJ_MSG_CHECKIN_TO_WORK"];
            //}

            return Json(msg);

        }

        public class ShiftLogManual
        {
            public string ShiftCode { get; set; }
            public string ChkinLocationTxt { get; set; }
            public string ChkoutLocationTxt { get; set; }
            public DateTime? ChkinTime { get; set; }
            public DateTime? ChkoutTime { get; set; }
            public string ChkinPicRealtime { get; set; }
            public string ChkoutPicRealtime { get; set; }
            public string Note { get; set; }
            public bool IsChkinRealtime { get; set; }
        }
        public class ItemWork
        {
            public string WorkSession { get; set; }
            public List<TagsAttr> Tags1 { get; set; }
            public string StartTime { get; set; }
            public string EndTime { get; set; }
            public decimal ProgressFromStaff { get; set; }
            public decimal ProgressFromLeader { get; set; }
            public string NoteFromLeader { get; set; }
            public string CardCode { get; set; }
            public string UserName { get; set; }
            public string ShiftCode { get; set; }
            public string ChkListCode { get; set; }
            public string UserLeader { get; set; }
        }

        public class WorkSessionResultTemp
        {
            public int Id { get; set; }
            public DateTime? StartTime { get; set; }
            public DateTime? EndTime { get; set; }
            public decimal ProgressFromLeader { get; set; }
            public decimal ProgressFromStaff { get; set; }
            public string CheckTitle { get; set; }
        }
        public class TagsAttr
        {
            public string Text { get; set; }
            public string Code { get; set; }
        }
        public class ViewItem
        {
            public int Id { get; set; }
            public string WorkSession { get; set; }
            public List<SessionItemChkItem> ItemWorkList { get; set; }
            public string Note { get; set; }
            public string Status { get; set; }
            public decimal Progress { get; set; }
            public string Value { get; set; }
            public string UserName { get; set; }
            public string CreatedBy { get; set; }
            public bool CheckItem { get; set; }
            public DateTime TimeCheckIn { get; set; }
            public List<WorkSessionResultTemp> listItemActivity { get; set; }
        }
        public class ItemStaff
        {
            public int Id { get; set; }
            public string WorkSession { get; set; }
            public decimal Progress { get; set; }
            public string CardCode { get; set; }
            public string[] ListCode { get; set; }
        }
        #endregion

        #region Check success
        [HttpPost]
        public bool CheckCardSuccess(string cardCode)
        {
            var listCardItem = _context.CardItemChecks.Where(x => x.CardCode == cardCode && !x.Flag).ToList();
            //var listSession = from a in _context.WORKItemSessions.Where(x => x.CardCode == cardCode && !x.IsDeleted)
            //                  join b in _context.WORKItemSessionResults.Where(x => !x.IsDeleted) on a.WorkSession equals b.WorkSession
            //                  select new
            //                  {
            //                      Progress = b.ProgressFromLeader
            //                  };
            bool check = false;

            if (listCardItem.Count > 0)
            {
                foreach (var cardItem in listCardItem)
                {
                    if (cardItem.Completed == 100)
                    {
                        check = true;
                    }
                    else
                    {
                        check = false;
                        break;
                    }

                }
                //if (listSession.Count > 0 && check == true)
                //{
                //    foreach (var session in listSession)
                //    {
                //        if (session.Progress == 100)
                //        {
                //            check = true;

                //        }
                //        else
                //        {
                //            check = false;
                //            break;
                //        }
                //    }
                //}
                //else
                //{
                //    check = false;
                //}
            }
            else
            {
                check = false;
            }
            return check;
        }

        [HttpPost]
        public object CheckListAll()
        {
            var lists = _context.WORKOSLists.Where(x => !x.IsDeleted).DistinctBy(x => x.ListCode);
            List<CheckListSuccess> listCheck = new List<CheckListSuccess>();
            foreach (var list in lists)
            {
                var objTemp = new CheckListSuccess();
                var cardInList = _context.WORKOSCards.Where(x => x.ListCode == list.ListCode && !x.IsDeleted).ToList();

                foreach (var item in cardInList)
                {
                    if (item.Status == "DONE")
                    {
                        objTemp.IsSuccess = true;
                    }
                    else
                    {
                        objTemp.IsSuccess = false;
                        break;
                    }
                    objTemp.ListCode = item.ListCode;
                    listCheck.Add(objTemp);
                }
            }
            return listCheck.DistinctBy(x => x.ListCode);
        }
        public class CheckListSuccess
        {
            public string ListCode { get; set; }
            public bool IsSuccess { get; set; }
        }
        #endregion

        #region Show gantt
        [HttpPost]
        public JsonResult SearchProgress(string boardCode)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                boardCode = string.IsNullOrEmpty(boardCode) ? _context.WORKOSBoards.Where(x => !string.IsNullOrEmpty(x.BoardCode)).Last().BoardCode : boardCode;
                if (!string.IsNullOrEmpty(boardCode))
                {
                    var query = from a in _context.WORKOSBoards
                                join b in _context.WORKOSLists on a.BoardCode equals b.BoardCode
                                join c in _context.WORKOSCards on b.ListCode equals c.ListCode
                                where a.BoardCode == boardCode && !string.IsNullOrEmpty(a.BoardCode) && !c.IsDeleted
                                select new
                                {
                                    c.CardID,
                                    c.CardCode,
                                    c.CardName,
                                    BeginTime = c.BeginTime.ToString("dd/MM/yyyy"),
                                    //Duration = (int)((c.EndTime != null ? c.EndTime : DateTime.Now) - c.BeginTime).TotalDays,
                                    Completed = c.Completed / 100
                                };
                    var projectCompleted = query.Any() ? (query.Where(x => x.Completed == 1).Count() / (query.Count())) : 0;
                    msg.Object = new
                    {
                        ListProgress = query,
                        DetailBoard = _context.WORKOSBoards.Where(x => x.BoardCode == boardCode && x.IsDeleted == false).Select(x => new
                        {
                            x.BoardID,
                            x.BoardName,
                            StartTime = x.BeginTime.ToString("dd/MM/yyyy"),
                            EndTime = x.Deadline.ToString("dd/MM/yyyy"),
                            Duration = (int)(x.Deadline - x.BeginTime).TotalDays,
                            Completed = x.Completed
                        }).FirstOrDefault()
                    };
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

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_stringLocalizerProject.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerCustomer.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerSupplier.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerContract.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerRQWPrice.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerContractPO.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerRQRaw.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerSVC.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerMaterialProd.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_staffTimeKeepingController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                ;
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion

        #region Location
        public class AddressJobCarModel
        {
            public string CardCode { get; set; }
            public string LocationText { get; set; }
            public string LocationGps { get; set; }
        }
        [HttpPost]
        public JsonResult InsertAddressJobCard([FromBody]AddressJobCarModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                WORKOSAddressCard insertAddress = new WORKOSAddressCard
                {
                    CardCode = obj.CardCode,
                    LocationText = obj.LocationText,
                    LocationGps = obj.LocationGps,
                    CreatedBy = ESEIM.AppContext.UserName,
                    CreatedTime = DateTime.Now
                };
                var activity = new CardUserActivity
                {
                    UserId = ESEIM.AppContext.UserId,
                    IdObject = "ADDR",
                    Action = "ADD",
                    IsCheck = true,
                    CardCode = obj.CardCode,
                    CreatedTime = DateTime.Now,
                    FromDevice = "Laptop/Desktop",
                    ChangeDetails = obj.LocationText
                };

                _context.CardUserActivitys.Add(activity);
                _context.WORKOSAddressCards.Add(insertAddress);
                _context.SaveChanges();
                msg.Title = _stringLocalizer["CJ_MSG_ADD_ADDRESS_SUCCESS"];
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Object = ex.Message;
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult DeleteAddressJobCard(int Id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.WORKOSAddressCards.FirstOrDefault(x => x.Id == Id);
                data.IsDeleted = true;
                data.DeletedBy = ESEIM.AppContext.UserName;
                data.DeletedTime = DateTime.Now;

                var activity = new CardUserActivity
                {
                    UserId = ESEIM.AppContext.UserId,
                    IdObject = "ADDR",
                    Action = "DELETE",
                    IsCheck = true,
                    CardCode = data.CardCode,
                    CreatedTime = DateTime.Now,
                    FromDevice = "Laptop/Desktop",
                    ChangeDetails = data.LocationText
                };
                _context.CardUserActivitys.Add(activity);
                _context.WORKOSAddressCards.Update(data);
                _context.SaveChanges();
                msg.Title = _stringLocalizer["CJ_MSG_DELETE_ADDRESS_SUCCESS"];

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Object = ex.Message;
            }
            return Json(msg);
        }
        [HttpPost]
        public object GetLisAddressJobCard(string CardCode)
        {
            var query = _context.WORKOSAddressCards.Where(x => x.CardCode.Equals(CardCode) && x.IsDeleted == false)
                .Select(x => new { x.Id, x.LocationGps, x.LocationText, x.CreatedBy, x.CreatedTime });
            return Json(query);
        }
        #endregion

        #region Copy JobCard

        #endregion

        #region Schedule card
        [HttpPost]
        public JsonResult ScheduleCard(int month, int year)
        {
            var session = HttpContext.GetSessionUser();
            var msg = new JMessage();
            var lstCountCard = new List<CalenderCard>();
            var listDateInMonth = DateTimeExtensions.GetDates(year, month);
            foreach (var item in listDateInMonth)
            {
                var cards = from a in _context.WORKOSCards.Where(x => !x.IsDeleted && x.BeginTime <= item.Date && (x.EndTime.HasValue ? x.EndTime.Value : x.Deadline) >= item.Date)
                            let lt = a.LstUser.Split(",", StringSplitOptions.None)
                            where session.IsAllData || (!string.IsNullOrEmpty(a.LstUser) && lt.Any(y => session.UserId == y)) || a.CreatedBy == session.UserName
                            select new
                            {
                                a.CardID,
                                a.Status,
                                a.CardCode
                            };
                var countCreated = cards.Where(x => x.Status == "CREATED").Count();
                var countStart = cards.Where(x => x.Status == "START").Count();
                var countDone = cards.Where(x => x.Status == "DONE").Count();
                var countCancled = cards.Where(x => x.Status == "CANCLED").Count();
                var calender = new CalenderCard
                {
                    Date = item,
                    Created = countCreated,
                    Started = countStart,
                    Done = countDone,
                    Cancled = countCancled
                };
                lstCountCard.Add(calender);
            }
            msg.Object = lstCountCard;
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetCardInCalendar([FromBody]CardCalendarModel jtablePara)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var date = !string.IsNullOrEmpty(jtablePara.Date) ? DateTime.ParseExact(jtablePara.Date, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            int intBeginFor = (jtablePara.CurrentPage - 1) * jtablePara.Length;
            var status = "";
            if (jtablePara.Value == 4)
            {
                status = "CREATED";
            }
            else if (jtablePara.Value == 3)
            {
                status = "START";
            }
            else if (jtablePara.Value == 2)
            {
                status = "DONE";
            }
            else
            {
                status = "CANCLED";
            }
            var session = HttpContext.GetSessionUser();
            var queryTab = from a in _context.WORKOSCards.Where(x => !x.IsDeleted && x.BeginTime <= date
                           && (x.EndTime.HasValue ? x.EndTime.Value : x.Deadline) >= date && x.Status == status && x.Status != "TRASH")
                           let lt = a.LstUser.Split(",", StringSplitOptions.None)
                           where session.IsAllData || (!string.IsNullOrEmpty(a.LstUser) && lt.Any(y => session.UserId == y)) || a.CreatedBy == session.UserName
                           select new
                           {
                               a.CardID,
                               a.CardCode,
                               a.CardName,
                               a.Deadline,
                               Status = _context.CommonSettings.FirstOrDefault(k => k.CodeSet == a.Status && !k.IsDeleted).ValueSet,
                               a.BeginTime,
                               a.EndTime
                           };

            int count = queryTab.Count();
            var data = queryTab.Skip(intBeginFor).Take(jtablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(
                                data,
                                jtablePara.Draw,
                                count,
                                "CardID", "CardCode", "CardName", "Deadline", "Status", "BeginTime", "EndTime");
            return Json(jdata);
        }

        public class CardCalendarModel : JTableModel
        {
            public string Date { get; set; }
            public int Value { get; set; }
        }
        #endregion

        [HttpPost]
        public object GetCardRelative(string cardCode)
        {
            var inherit = _context.WORKOSCards.FirstOrDefault(x => x.CardCode == cardCode && !x.IsDeleted).Inherit;
            var cardInherit = (from a in _context.WORKOSCards.Where(x => x.CardCode == inherit && !x.IsDeleted)
                               join b in _context.CommonSettings on a.Status equals b.CodeSet
                               select new
                               {
                                   Code = a.CardCode,
                                   Name = a.CardName,
                                   Status = b.ValueSet,
                                   EndDate = a.EndTime.HasValue ? a.EndTime.Value.ToString("dd/MM/yyyy") : ""
                               }).FirstOrDefault();

            var link = from a in _context.WORKOSCards.Where(x => x.CardCode == cardCode && !x.IsDeleted)
                       join b in _context.JobCardLinks.Where(x => !x.IsDeleted) on a.CardCode equals b.CardCode
                       select new
                       {
                           b.CardLink,
                           b.Id
                       };
            var cardLinks = from a in link
                            join b in _context.WORKOSCards.Where(x => !x.IsDeleted) on a.CardLink equals b.CardCode
                            select new
                            {
                                a.Id,
                                Code = b.CardCode,
                                Name = b.CardName,
                                Status = _context.CommonSettings.FirstOrDefault(x => x.CodeSet == b.Status).ValueSet,
                                EndDate = b.EndTime.HasValue ? b.EndTime.Value.ToString("dd/MM/yyyy") : ""
                            };
            return new
            {
                Inherit = cardInherit,
                Links = cardLinks
            };
        }
        public class JobCardUserItemMember
        {
            public string CardCode { get; set; }
            public string CheckListCode { get; set; }
        }
        public class JobCardUserSubItemMember
        {
            public string CardCode { get; set; }
            public string CheckListCode { get; set; }
            public string CheckItem { get; set; }
        }
        public class CalenderCard
        {
            public DateTime Date { get; set; }
            public int Created { get; set; }
            public int Started { get; set; }
            public int Done { get; set; }
            public int Cancled { get; set; }
        }
    }
}
