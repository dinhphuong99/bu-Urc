using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Utils;
using III.Admin.Controllers;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using ESEIM.Models;
using System;
using System.Collections.Generic;
using III.Domain.Enums;
using System.Globalization;
using FTU.Utils.HelperNet;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class DashBoardController : BaseController
    {
        private readonly IStringLocalizer<DashBoardController> _stringLocalizer;
        private readonly IStringLocalizer<CardJobController> _cardJobController;
        private readonly IStringLocalizer<AssetAllocationController> _assetAllocationController;
        private readonly IStringLocalizer<AssetBuyController> _assetBuyController;
        private readonly IStringLocalizer<AssetCancelController> _assetCancelController;
        private readonly IStringLocalizer<AssetImprovementController> _assetImprovementController;
        private readonly IStringLocalizer<AssetInventoryController> _assetInventoryController;
        private readonly IStringLocalizer<AssetLiquidationController> _assetLiquidationController;
        private readonly IStringLocalizer<AssetMaintenanceController> _assetMaintenanceController;
        private readonly IStringLocalizer<AssetRecalledController> _assetRecalledController;
        private readonly IStringLocalizer<AssetRPTBrokenController> _assetRPTBrokenController;
        private readonly IStringLocalizer<AssetRqMaintenanceRepairController> _assetRqMaintenanceRepairController;
        private readonly IStringLocalizer<AssetTransferController> _assetTransferController;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly EIMDBContext _context;
        private readonly IRepositoryService _repositoryService;
        public class JTableModelCustom : JTableModel
        {
            public string DepartmentCode { get; set; }
            public string GroupUserCode { get; set; }
            public string UserName { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string Code { get; set; }
            public string Title { get; set; }
        }

        public class JMessage2 : JMessage
        {
            public object Object2 { get; set; }
        }
        public DashBoardController(EIMDBContext context, IStringLocalizer<DashBoardController> stringLocalizer,
            IStringLocalizer<SharedResources> sharedResources, IRepositoryService repositoryService,
            IStringLocalizer<CardJobController> cardJobController, IStringLocalizer<AssetAllocationController> assetAllocationController,
            IStringLocalizer<AssetBuyController> assetBuyController, IStringLocalizer<AssetCancelController> assetCancelController,
            IStringLocalizer<AssetImprovementController> assetImprovementController, IStringLocalizer<AssetInventoryController> assetInventoryController,
             IStringLocalizer<AssetLiquidationController> assetLiquidationController, IStringLocalizer<AssetMaintenanceController> assetMaintenanceController,
             IStringLocalizer<AssetRecalledController> assetRecalledController, IStringLocalizer<AssetRPTBrokenController> assetRPTBrokenController,
             IStringLocalizer<AssetRqMaintenanceRepairController> assetRqMaintenanceRepairController, IStringLocalizer<AssetTransferController> assetTransferController)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
            _repositoryService = repositoryService;
            _cardJobController = cardJobController;
            _assetAllocationController = assetAllocationController;
            _assetBuyController = assetBuyController;
            _assetCancelController = assetCancelController;
            _assetImprovementController = assetImprovementController;
            _assetInventoryController = assetInventoryController;
            _assetLiquidationController = assetLiquidationController;
            _assetMaintenanceController = assetMaintenanceController;
            _assetRecalledController = assetRecalledController;
            _assetRPTBrokenController = assetRPTBrokenController;
            _assetRqMaintenanceRepairController = assetRqMaintenanceRepairController;
            _assetTransferController = assetTransferController;
        }
        public IActionResult Index()
        {
            return View();
        }
        #region Notification
        [HttpPost]
        public object JTable([FromBody]ProjectManagementJtable jTablePara)
        {
            var session = HttpContext.GetSessionUser();
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = (from a in _context.WORKOSCards.Where(x => !x.IsDeleted && x.Status != "TRASH" && x.Status != "CANCLED")
                         join b in _context.WORKOSLists.Where(x => !x.IsDeleted) on a.ListCode equals b.ListCode
                         join c in _context.WORKOSBoards.Where(x => !x.IsDeleted) on b.BoardCode equals c.BoardCode
                         join d in _context.CardMappings on a.CardCode equals d.CardCode
                         join e in _context.JcObjectIdRelatives.Where(x => !x.IsDeleted) on a.CardCode equals e.CardCode into e1
                         from e2 in e1.DefaultIfEmpty()
                         where (d.UserId == session.UserId) || (a.CreatedBy == session.UserName) &&
                         a.CreatedDate.Date == DateTime.Now.Date
                         select new CardNotifi
                         {
                             CardID = a.CardID,
                             CardCode = a.CardCode,
                             CardName = a.CardName,
                             BeginTime = a.BeginTime,
                             EndTime = a.EndTime,
                             ListUserView = a.ListUserView,
                             ListName = b.ListName,
                             BoardName = c.BoardName,
                             UpdatedTimeTxt = a.UpdatedTime.HasValue ? a.UpdatedTime.Value.ToString("dd/MM/yyyy HH:mm:ss") : "",
                             WorkType = !string.IsNullOrEmpty(a.WorkType) ? _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.WorkType).ValueSet : "",
                             Priority = !string.IsNullOrEmpty(a.CardLevel) ? _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.CardLevel).ValueSet : "",
                             Status = _context.CommonSettings.FirstOrDefault(x => x.CodeSet == a.Status && !x.IsDeleted).ValueSet,
                             ProjectName = e2.ObjTypeCode == "PROJECT" ? _context.Projects.FirstOrDefault(x => !x.FlagDeleted && x.ProjectCode == e2.ObjID).ProjectTitle : "",
                             ContractName = e2.ObjTypeCode == "CONTRACT" ? _context.PoSaleHeaders.FirstOrDefault(x => !x.IsDeleted && x.ContractCode == e2.ObjID).Title : "",
                         }).DistinctBy(x => x.CardCode).OrderByDescending(x => x.CardID);
            var listCard = new List<CardNotifi>();
            foreach (var item in query)
            {
                if (string.IsNullOrEmpty(item.ListUserView) || (!string.IsNullOrEmpty(item.ListUserView) && !item.ListUserView.Contains(session.UserId)))
                {
                    listCard.Add(item);
                }
            }
            var data = listCard.Skip(intBeginFor).Take(jTablePara.Length).ToList();
            var count = listCard.Count();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "CardID", "CardCode", "CardName", "Status",
                "BeginTime", "EndTime", "ListName", "BoardName", "ProjectName", "ContractName", "UpdatedTimeTxt", "WorkType", "Priority");
            return Json(jdata);
        }

        [HttpPost]
        public JsonResult JtableAsset([FromBody]AssetJtable jTablePara)
        {
            var session = HttpContext.GetSessionUser();
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = (from a in _context.AssetAllocateHeaders.Where(x => !x.IsDeleted && x.Status == "ASSET_CREATE")
                         join b in _context.WorkflowActivityRoles.Where(x => !x.IsDeleted && x.Role == session.RoleCode
                         && x.BranchCode == session.BranchId && session.ListDepartment.Any(k => k == x.DepartCode)) on a.ObjActCode equals b.WorkFlowCode
                         select new
                         {
                             ID = a.ID,
                             Code = a.TicketCode,
                             Name = a.Title,
                             Status = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.Status).ValueSet,
                             TypeCode = "ALLOCATE",
                             TypeName = "Phiếu cấp phát tài sản"
                         }).Union(
                from a in _context.AssetLiquidationHeaders.Where(x => !x.IsDeleted && x.Status == "ASSET_CREATE")
                join b in _context.WorkflowActivityRoles.Where(x => !x.IsDeleted && x.Role == session.RoleCode
                && x.BranchCode == session.BranchId && session.ListDepartment.Any(k => k == x.DepartCode)) on a.ObjActCode equals b.WorkFlowCode
                select new
                {
                    ID = a.ID,
                    Code = a.TicketCode,
                    Name = a.Title,
                    Status = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.Status).ValueSet,
                    TypeCode = "LIQUIDATION",
                    TypeName = "Phiếu thu hồi tài sản"
                }).Union(
                from a in _context.AssetBuyHeaders.Where(x => !x.IsDeleted && x.Status == "ASSET_CREATE")
                join b in _context.WorkflowActivityRoles.Where(x => !x.IsDeleted && x.Role == session.RoleCode
                && x.BranchCode == session.BranchId && session.ListDepartment.Any(k => k == x.DepartCode)) on a.ObjActCode equals b.WorkFlowCode
                select new
                {
                    ID = a.ID,
                    Code = a.TicketCode,
                    Name = a.Title,
                    Status = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.Status).ValueSet,
                    TypeCode = "BUY",
                    TypeName = "Phiếu mua sắm tài sản"
                }).Union(
                from a in _context.AssetInventoryHeaders.Where(x => !x.IsDeleted && x.Status == "ASSET_CREATE")
                join b in _context.WorkflowActivityRoles.Where(x => !x.IsDeleted && x.Role == session.RoleCode
                && x.BranchCode == session.BranchId && session.ListDepartment.Any(k => k == x.DepartCode)) on a.ObjActCode equals b.WorkFlowCode
                select new
                {
                    ID = a.AssetID,
                    Code = a.TicketCode,
                    Name = a.Title,
                    Status = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.Status).ValueSet,
                    TypeCode = "INVENTORY",
                    TypeName = "Phiếu kiểm kê tài sản"
                }).Union(
                from a in _context.AssetTransferHeaders.Where(x => !x.IsDeleted && x.Status == "ASSET_CREATE")
                join b in _context.WorkflowActivityRoles.Where(x => !x.IsDeleted && x.Role == session.RoleCode
                && x.BranchCode == session.BranchId && session.ListDepartment.Any(k => k == x.DepartCode)) on a.ObjActCode equals b.WorkFlowCode
                select new
                {
                    ID = a.AssetID,
                    Code = a.Ticketcode,
                    Name = a.Ticket,
                    Status = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.Status).ValueSet,
                    TypeCode = "TRANSFER",
                    TypeName = "Phiếu điều chuyển tài sản"
                }).Union(
                from a in _context.AssetRPTBrokenHeaders.Where(x => !x.IsDeleted && x.AssetStatus == "ASSET_CREATE")
                join b in _context.WorkflowActivityRoles.Where(x => !x.IsDeleted && x.Role == session.RoleCode
                && x.BranchCode == session.BranchId && session.ListDepartment.Any(k => k == x.DepartCode)) on a.ObjActCode equals b.WorkFlowCode
                select new
                {
                    ID = a.AssetID,
                    Code = a.TicketCode,
                    Name = a.Ticket,
                    Status = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.AssetStatus).ValueSet,
                    TypeCode = "RPTBROKEN",
                    TypeName = "Phiếu báo mất/hỏng tài sản"
                }).Union(
                from a in _context.AssetRqMaintenanceRepairHeaders.Where(x => !x.IsDeleted && x.Status == "ASSET_CREATE")
                join b in _context.WorkflowActivityRoles.Where(x => !x.IsDeleted && x.Role == session.RoleCode
                && x.BranchCode == session.BranchId && session.ListDepartment.Any(k => k == x.DepartCode)) on a.ObjActCode equals b.WorkFlowCode
                select new
                {
                    ID = a.ID,
                    Code = a.TicketCode,
                    Name = a.Title,
                    Status = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.Status).ValueSet,
                    TypeCode = "RQMAINTENACE_REPAIR",
                    TypeName = "Phiếu yêu cầu SCBD"
                }).Union(
                from a in _context.AssetRecalledHeaders.Where(x => !x.IsDeleted && x.Status == "ASSET_CREATE")
                join b in _context.WorkflowActivityRoles.Where(x => !x.IsDeleted && x.Role == session.RoleCode
                && x.BranchCode == session.BranchId && session.ListDepartment.Any(k => k == x.DepartCode)) on a.ObjActCode equals b.WorkFlowCode
                select new
                {
                    ID = a.ID,
                    Code = a.TicketCode,
                    Name = a.Title,
                    Status = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.Status).ValueSet,
                    TypeCode = "RECALLED",
                    TypeName = "Phiếu thu hồi tài sản"
                }).Union(
                from a in _context.AssetMaintenanceHeaders.Where(x => !x.IsDeleted && x.Status == "ASSET_CREATE")
                join b in _context.WorkflowActivityRoles.Where(x => !x.IsDeleted && x.Role == session.RoleCode
                && x.BranchCode == session.BranchId && session.ListDepartment.Any(k => k == x.DepartCode)) on a.ObjActCode equals b.WorkFlowCode
                select new
                {
                    ID = a.TicketID,
                    Code = a.TicketCode,
                    Name = a.Title,
                    Status = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.Status).ValueSet,
                    TypeCode = "MAINTENANCE",
                    TypeName = "Phiếu sửa chữa tài sản"
                }).Union(
                from a in _context.AssetCancelHeaders.Where(x => !x.IsDeleted && x.Status == "ASSET_CREATE")
                join b in _context.WorkflowActivityRoles.Where(x => !x.IsDeleted && x.Role == session.RoleCode
                && x.BranchCode == session.BranchId && session.ListDepartment.Any(k => k == x.DepartCode)) on a.ObjActCode equals b.WorkFlowCode
                select new
                {
                    ID = a.AssetID,
                    Code = a.TicketCode,
                    Name = a.Title,
                    Status = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.Status).ValueSet,
                    TypeCode = "CANCLED",
                    TypeName = "Phiếu hủy tài sản"
                }).Union(
                from a in _context.AssetImprovementHeaders.Where(x => !x.IsDeleted && x.Status == "ASSET_CREATE")
                join b in _context.WorkflowActivityRoles.Where(x => !x.IsDeleted && x.Role == session.RoleCode
                && x.BranchCode == session.BranchId && session.ListDepartment.Any(k => k == x.DepartCode)) on a.ObjActCode equals b.WorkFlowCode
                select new
                {
                    ID = a.TicketID,
                    Code = a.TicketCode,
                    Name = a.Title,
                    Status = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.Status).ValueSet,
                    TypeCode = "IMPROVEMENT",
                    TypeName = "Phiếu bảo dưỡng tài sản"
                });

            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var count = query.Count();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "ID", "Code", "Name", "Status", "TypeCode", "TypeName");
            return Json(jdata);
        }

        [HttpPost]
        public JsonResult JtableInfo([FromBody]CMSItemsJTableModel jTablePara)
        {
            var today = DateTime.Today;
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.cms_items
                        join b in _context.cms_categories on a.cat_id equals b.id
                        where (a.date_post.HasValue && a.date_post.Value.Date == today)
                        select new
                        {
                            id = a.id,
                            title = a.title,
                            alias = a.alias,
                            name = b.name,
                            published = a.published,
                            created = a.created,
                            modified = a.modified,
                            date_post = a.date_post
                        };

            int count = query.Count();
            var data = query.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length);
            var jdata = JTableHelper.JObjectTable(data.ToList(), jTablePara.Draw, count, "id", "title", "alias", "name", "published", "created", "modified", "date_post");
            return Json(jdata);
        }
        #endregion
        #region Chart
        [HttpPost]
        public object GetCount()
        {
            var project = _context.Projects.Where(x => !x.FlagDeleted);
            var numProjectPending = project.Where(x => x.Status == "PROJECT_STATUS_PENDING").Count();
            var progressProject = Math.Round(Convert.ToDouble(numProjectPending) / project.Count() * 100);

            var contract = _context.PoSaleHeaders.Where(x => !x.IsDeleted);
            var numContract = contract.DistinctBy(x => x.ContractCode).Count();
            var numContractPending = contract.Where(x => x.Status == "CONTRACT_STATUS_PO_PENDING").Count();
            var progressContract = Math.Round((Convert.ToDouble(numContractPending) / numContract) * 100);

            var cardJob = _context.WORKOSCards.Where(x => !x.IsDeleted);
            var allCard = cardJob.Count();
            var cardJobPending = cardJob.Where(x => x.Status == "START").Count();
            var cardJobDone = cardJob.Where(x => x.Status == "DONE").Count();
            var cardJobCancled = cardJob.Where(x => x.Status == "CANCLED").Count();
            var progressCard = Math.Round((Convert.ToDouble(cardJobDone) / cardJobPending) * 100);

            var totalUser = _context.Users.Where(x => x.Active).Count();

            var toDay = DateTime.Today;
            var list = new List<WorkShiftCheckInOut>();
            //var uId = _context.WorkShiftCheckInOuts.Where(x => !x.IsDeleted).DistinctBy(x => x.UserId).Select(x => x.UserId).ToList();
            //foreach (var id in uId)
            //{
            //    var idUser = _context.WorkShiftCheckInOuts.Where(x => x.UserId.Equals(id) && !x.IsDeleted).Max(x => x.Id);
            //    var max = _context.WorkShiftCheckInOuts.FirstOrDefault(x => x.Id == idUser);
            //    if (max.Action == EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.CheckIn))
            //    {
            //        list.Add(max);
            //    }
            //}

            //var data = (from a in list
            //            join b in _context.Users on a.UserId equals b.Id
            //            where (a.ActionTime.Date >= toDay)
            //            select new
            //            {
            //                a.Id,
            //                EmployCode = b.EmployeeCode != null ? b.EmployeeCode : "Chưa có mã",
            //                b.GivenName,
            //                a.LocationGPS,
            //                b.Gender,
            //                b.PhoneNumber,
            //                b.Email,
            //                a.ActionTime,
            //                a.ShiftCode,
            //                ListRoleGroup = (from d in _context.Roles
            //                                 join e in _context.AdUserInGroups on d.Id equals e.RoleId into e1
            //                                 from e2 in e1.DefaultIfEmpty()
            //                                 where e2.IsDeleted == false && e2.UserId.Equals(a.UserId)
            //                                 select new
            //                                 {
            //                                     RoleCode = d.Code,
            //                                     RoleName = d.Title
            //                                 }).DistinctBy(k => k.RoleCode)
            //            });
            var data = _context.Users.Where(x => x.IsOnline == 1 && x.Active); ;
            var progressUser = Math.Round((Convert.ToDouble(data.Count()) / totalUser) * 100);
            return new
            {
                Project = project.Count(),
                ProjectPending = numProjectPending,
                ContractPO = numContract,
                ContractPending = numContractPending,
                AllCard = allCard,
                CardPending = cardJobPending,
                CardDone = cardJobDone,
                CardCancled = cardJobCancled,
                TotalUser = totalUser,
                UserOnline = data.Count(),
                ProgressPro = progressProject,
                ProgressContract = progressContract,
                ProgressCard = progressCard,
                ProgressUser = progressUser
            };
        }
        [HttpPost]
        public object AmchartCountBuy()
        {
            //var timeNowYear = DateTime.Now.Year;
            //var data = _context.PoBuyerHeaders.Where(a => !a.IsDeleted && a.CreatedTime.Value.Year == timeNowYear)
            // .Select(p => new { p.ExchangeRate, Month = p.CreatedTime.Value.Month }).GroupBy(x => new { x.Month })
            // .Select(p => new
            // {
            //     Month = p.First().Month,
            //     income = p.Count(),
            //     Total = p.Sum(y => y.ExchangeRate),
            // }).OrderBy(p => p.Month).ToList();

            var data = _context.VAmchartCountBuys.Select(p => new
            {
                Month = p.Month,
                income = p.Income,
                Total = p.Total,
            }).OrderBy(p => p.Month).AsNoTracking();

            return data;
        }
        [HttpPost]
        public object AmchartCountSale()
        {
            //var timeNowYear = DateTime.Now.Year;
            //var data = _context.PoSaleHeaders.Where(a => !a.IsDeleted && a.CreatedTime.Value.Year == timeNowYear)
            //   .Select(p => new { p.BudgetExcludeTax, Month = p.CreatedTime.Value.Month }).GroupBy(x => new { x.Month })
            //   .Select(p => new
            //   {
            //       Month = p.First().Month,
            //       income = p.Count(),
            //       Total = p.Sum(y => y.BudgetExcludeTax),
            //   }).OrderBy(p => p.Month).ToList();

            var data = _context.VAmchartCountSales.Select(p => new
            {
                Month = p.Month,
                income = p.Income,
                Total = p.Total,
            }).OrderBy(p => p.Month).AsNoTracking();

            return data;
        }

        [HttpPost]
        public object AmchartPieBuy([FromBody] TimePieModel obj)
        {
            var searchTime = !string.IsNullOrEmpty(obj.TimePieBuy) ? DateTime.ParseExact(obj.TimePieBuy, "MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var month = searchTime.HasValue ? searchTime.Value.Month.ToString() : "";
            var year = searchTime.HasValue ? searchTime.Value.Year.ToString() : "";

            //var data = (from a in _context.PoBuyerHeaders
            //            where !a.IsDeleted
            //               && (searchTime == null || ((a.CreatedTime.Value.Month == searchTime.Value.Month) && (a.CreatedTime.Value.Year == searchTime.Value.Year)))
            //            group a by a.Status into grp
            //            select new
            //            {
            //                status = grp.First().Status,
            //                country = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == grp.First().Status).ValueSet,
            //                litres = grp.Count()
            //            }).OrderBy(x => x.status);

            string[] param = new string[] { "@monthData", "@yearData" };
            object[] val = new object[] { month, year };
            DataTable rs = _repositoryService.GetDataTableProcedureSql("P_AMCHART_PIE_BUY", param, val);
            var data = CommonUtil.ConvertDataTable<PChartModel>(rs).Select(p => new
            {
                status = p.Status,
                country = p.Country,
                litres = p.Litres,
            }).OrderBy(p => p.status);

            return data;
        }
        [HttpPost]
        public object AmchartPieSale([FromBody] TimePieModel obj)
        {
            var searchTime = !string.IsNullOrEmpty(obj.TimePieBuy) ? DateTime.ParseExact(obj.TimePieBuy, "MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var month = searchTime.HasValue ? searchTime.Value.Month.ToString() : "";
            var year = searchTime.HasValue ? searchTime.Value.Year.ToString() : "";

            //var data = (from a in _context.PoSaleHeaders
            //            where !a.IsDeleted
            //               && (searchTime == null || ((a.CreatedTime.Value.Month == searchTime.Value.Month) && (a.CreatedTime.Value.Year == searchTime.Value.Year)))
            //            group a by a.Status into grp
            //            select new
            //            {
            //                status = grp.First().Status,
            //                country = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == grp.First().Status).ValueSet,
            //                litres = grp.Count()
            //            }).OrderBy(x => x.status);

            string[] param = new string[] { "@monthData", "@yearData" };
            object[] val = new object[] { month, year };
            DataTable rs = _repositoryService.GetDataTableProcedureSql("P_AMCHART_PIE_SALE", param, val);
            var data = CommonUtil.ConvertDataTable<PChartModel>(rs).Select(p => new
            {
                status = p.Status,
                country = p.Country,
                litres = p.Litres,
            }).OrderBy(p => p.status);


            return data;
        }
        [HttpPost]
        public object AmchartCountCustomers()
        {
            //var timeNowYear = DateTime.Now.Year;
            //var data = (from a in _context.Customerss
            //            where a.IsDeleted == false && a.CreatedTime.Value.Year == timeNowYear
            //            group a by a.CreatedTime.Value.Month into grp
            //            select new
            //            {
            //                month = grp.First().CreatedTime.Value.Month,
            //                income = grp.Count()
            //            }).OrderBy(x => x.month);

            var data = _context.VAmchartCountCustomers.Select(p => new
            {
                month = p.Month,
                income = p.Income,
                //Total = p.Total,
            }).OrderBy(p => p.month).AsNoTracking();

            return data;
        }
        [HttpPost]
        public object AmchartCountSupplier()
        {
            //var timeNowYear = DateTime.Now.Year;
            //var data = (from a in _context.Suppliers
            //            where a.IsDeleted == false && a.CreatedTime.Value.Year == timeNowYear
            //            group a by a.CreatedTime.Value.Month into grp
            //            select new
            //            {
            //                month = grp.First().CreatedTime.Value.Month,
            //                income = grp.Count()
            //            }).OrderBy(x => x.month);

            var data = _context.VAmchartCountSuppliers.Select(p => new
            {
                month = p.Month,
                income = p.Income,
                //Total = p.Total,
            }).OrderBy(p => p.month).AsNoTracking();

            return data;
        }
        [HttpPost]
        public object AmchartPieCustomers([FromBody] TimePieModel obj)
        {
            var searchTime = !string.IsNullOrEmpty(obj.TimePieBuy) ? DateTime.ParseExact(obj.TimePieBuy, "MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var month = searchTime.HasValue ? searchTime.Value.Month.ToString() : "";
            var year = searchTime.HasValue ? searchTime.Value.Year.ToString() : "";

            //var data = (from a in _context.Customerss
            //            where !a.IsDeleted
            //               && (searchTime == null || ((a.CreatedTime.Value.Month == searchTime.Value.Month) && (a.CreatedTime.Value.Year == searchTime.Value.Year)))
            //            group a by a.ActivityStatus into grp
            //            select new
            //            {
            //                ActivityStatus = grp.First().ActivityStatus,
            //                country = _context.CommonSettings.FirstOrDefault(y => y.CodeSet == grp.First().ActivityStatus).ValueSet ?? "Không xác định",
            //                litres = grp.Count()
            //            }).OrderBy(x => x.ActivityStatus);

            string[] param = new string[] { "@monthData", "@yearData" };
            object[] val = new object[] { month, year };
            DataTable rs = _repositoryService.GetDataTableProcedureSql("P_AMCHART_PIE_CUSTOMER", param, val);
            var data = CommonUtil.ConvertDataTable<PChartModel>(rs).Select(p => new
            {
                ActivityStatus = p.Status,
                country = p.Country,
                litres = p.Litres,
            }).OrderBy(p => p.ActivityStatus);

            return data;
        }
        [HttpPost]
        public object AmchartPieSupplier([FromBody] TimePieModel obj)
        {
            var searchTime = !string.IsNullOrEmpty(obj.TimePieBuy) ? DateTime.ParseExact(obj.TimePieBuy, "MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var month = searchTime.HasValue ? searchTime.Value.Month.ToString() : "";
            var year = searchTime.HasValue ? searchTime.Value.Year.ToString() : "";

            //var data = (from a in _context.Suppliers
            //            where !a.IsDeleted
            //               && (searchTime == null || ((a.CreatedTime.Value.Month == searchTime.Value.Month) && (a.CreatedTime.Value.Year == searchTime.Value.Year)))
            //            group a by a.Status into grp
            //            select new
            //            {
            //                status = grp.First().Status,
            //                country = _context.CommonSettings.FirstOrDefault(y => y.CodeSet == grp.First().Status).ValueSet ?? "Không xác định",
            //                litres = grp.Count()
            //            }).OrderBy(x => x.status);


            string[] param = new string[] { "@monthData", "@yearData" };
            object[] val = new object[] { month, year };
            DataTable rs = _repositoryService.GetDataTableProcedureSql("P_AMCHART_PIE_SUPPLIER", param, val);
            var data = CommonUtil.ConvertDataTable<PChartModel>(rs).Select(p => new
            {
                status = p.Status,
                country = p.Country,
                litres = p.Litres,
            }).OrderBy(p => p.status);

            return data;
        }
        [HttpPost]
        public object AmchartCountProject()
        {
            //var timeNowYear = DateTime.Now.Year;
            //var data = (from a in _context.Projects
            //            where !a.FlagDeleted && a.StartTime.Year == timeNowYear
            //            group a by a.StartTime.Month into grp
            //            select new
            //            {
            //                month = grp.First().StartTime.Month,
            //                income = grp.Count()
            //            }).OrderBy(x => x.month);

            var data = _context.VAmchartCountProjects.Select(p => new
            {
                month = p.Month,
                income = p.Income,
                //Total = p.Total,
            }).OrderBy(p => p.month).AsNoTracking();

            return data;
        }
        [HttpPost]
        public object AmchartPieProject([FromBody] TimePieModel obj)
        {
            var searchTime = !string.IsNullOrEmpty(obj.TimePieBuy) ? DateTime.ParseExact(obj.TimePieBuy, "MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var month = searchTime.HasValue ? searchTime.Value.Month.ToString() : "";
            var year = searchTime.HasValue ? searchTime.Value.Year.ToString() : "";

            //var data = (from a in _context.Projects
            //            where !a.FlagDeleted
            //               && (searchTime == null || ((a.StartTime.Month == searchTime.Value.Month) && (a.StartTime.Year == searchTime.Value.Year)))
            //            group a by a.Status into grp
            //            select new
            //            {
            //                Status = grp.First().Status,
            //                country = _context.CommonSettings.FirstOrDefault(y => y.CodeSet == grp.First().Status).ValueSet ?? "Không xác định",
            //                litres = grp.Count()
            //            }).OrderBy(x => x.Status);

            string[] param = new string[] { "@monthData", "@yearData" };
            object[] val = new object[] { month, year };
            DataTable rs = _repositoryService.GetDataTableProcedureSql("P_AMCHART_PIE_PROJECT", param, val);
            var data = CommonUtil.ConvertDataTable<PChartModel>(rs).Select(p => new
            {
                Status = p.Status,
                country = p.Country,
                litres = p.Litres,
            }).OrderBy(p => p.Status);

            return data;
        }
        [HttpPost]
        public object AmchartCountEmployees()
        {
            //var timeNowYear = DateTime.Now.Year;
            //var data = (from a in _context.HREmployees
            //            where a.flag == 1 && a.createtime.Value.Year == timeNowYear
            //            group a by a.createtime.Value.Month into grp
            //            select new
            //            {
            //                month = grp.First().createtime.Value.Month,
            //                income = grp.Count()
            //            }).OrderBy(x => x.month);

            var data = _context.VAmchartCountEmployees.Select(p => new
            {
                month = p.Month,
                income = p.Income,
                //Total = p.Total,
            }).OrderBy(p => p.month).AsNoTracking();

            return data;
        }
        [HttpPost]
        public JsonResult GetWorkFlow()
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

        [HttpPost]
        public JsonResult GetCardInBoard(string ObjCode)
        {
            var year = DateTime.Now.Year;
            var listWeight = (from a in _context.ProgressTrackings
                              join b in _context.WORKOSCards on a.CardCode equals b.CardCode
                              where !b.IsDeleted
                              select new
                              {
                                  a.CardCode,
                                  b.WeightNum,
                                  a.UpdatedTime,
                                  a.Progress
                              }).OrderByDescending(x => x.UpdatedTime);

            var query = (from a in _context.WORKOSBoards
                         join b in _context.WfObjects on a.BoardCode equals b.WfObjCode
                         where a.IsDeleted == false && b.WfObjType == "BOARD"
                         group a by new { a.BoardCode } into grp
                         select new
                         {
                             name = grp.First().BoardName,
                             data = (from k in _context.WORKOSLists
                                     join i in _context.WORKOSCards on k.ListCode equals i.ListCode
                                     join o in listWeight on i.CardCode equals o.CardCode
                                     join l in _context.JcObjectIdRelatives on i.CardCode equals l.CardCode into l1
                                     from l2 in l1.DefaultIfEmpty()
                                     where !k.IsDeleted && !i.IsDeleted && k.BoardCode == grp.First().BoardCode && i.CreatedDate.Year == year
                                     && ((string.IsNullOrEmpty(ObjCode)) || l2.ObjID.ToLower().Equals(ObjCode.ToLower()))
                                     group o by new { o.UpdatedTime.Month, o.CardCode } into grpCard
                                     select new
                                     {
                                         Month = grpCard.Key.Month,
                                         Progress = grpCard.First().Progress,
                                         WeighNum = grpCard.First().WeightNum
                                     }).GroupBy(x => x.Month)
                         });

            //var query = _context.VListBoards
            //    .Select(a => new
            //    {
            //        name = a.BoardName,
            //        data = _context.VCardProcesss.Where(p => p.BoardCode == a.BoardCode
            //        && p.Year == year && ((string.IsNullOrEmpty(ObjCode)) || p.ObjId.ToLower().Equals(ObjCode.ToLower()))).GroupBy(y => new { y.Month, y.CardCode })
            //        .Select(z => new
            //        {
            //            Month = z.Key.Month,
            //            Progress = z.First().Progress,
            //            Weight = z.First().WeightNum
            //        }).GroupBy(i => i.Month).ToList()
            //    });

            //var query1 = (from a in _context.VListBoards
            //              select new
            //              {
            //                  name = a.BoardName,
            //                  data = (from b in _context.VCardProcesss
            //                          where b.BoardCode == a.BoardCode
            //                   && b.Year == year && ((string.IsNullOrEmpty(ObjCode)) || b.ObjId.ToLower().Equals(ObjCode.ToLower()))
            //                          group b by new { b.Month, b.CardCode } into grpCard
            //                          select new
            //                          {
            //                              Month = grpCard.Key.Month,
            //                              Progress = grpCard.First().Progress,
            //                              WeighNum = grpCard.First().WeightNum
            //                          }).GroupBy(x => x.Month)
            //              });

            return Json(query);
        }
        [HttpGet]
        public object GetSystemLog(string type)
        {
            var dateNow = DateTime.Now;
            var weekNow = DateTime.Now.AddDays(-7);
            var monthNow = DateTime.Now.AddDays(-30);
            DateTime? dateSearch = null;
            switch (type)
            {
                case "DATE_NOW":
                    dateSearch = dateNow;
                    break;
                case "WEEK_NOW":
                    dateSearch = weekNow;
                    break;
                case "MONTH_NOW":
                    dateSearch = monthNow;
                    break;
            }

            //THẦU & DỰ ÁN
            var project = _context.Projects;
            var projectInsert = project.Where(x => !x.FlagDeleted && string.IsNullOrEmpty(x.UpdatedBy) && (string.IsNullOrEmpty(type) || (x.CreatedTime >= dateSearch))).Count();
            var projectUpdate = project.Where(x => !x.FlagDeleted && !string.IsNullOrEmpty(x.UpdatedBy) && (string.IsNullOrEmpty(type) || (x.UpdatedTime >= dateSearch))).Count();
            var projectDelete = project.Where(x => x.FlagDeleted && (string.IsNullOrEmpty(type) || (x.UpdatedTime >= dateSearch))).Count();
            var projectPeople = project.Where(x => !x.FlagDeleted && !string.IsNullOrEmpty(x.UpdatedBy) && (string.IsNullOrEmpty(type) || (x.UpdatedTime >= dateSearch))).GroupBy(x => new { UpdatedBy = !string.IsNullOrEmpty(x.UpdatedBy) ? x.UpdatedBy : "" }).Count();

            //HỢP ĐỒNG BÁN
            var poSale = _context.PoSaleHeaders;
            var poSaleInsert = poSale.Where(x => !x.IsDeleted && string.IsNullOrEmpty(x.UpdatedBy) && (string.IsNullOrEmpty(type) || (x.CreatedTime >= dateSearch))).Count();
            var poSaleUpdate = poSale.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.UpdatedBy) && (string.IsNullOrEmpty(type) || (x.UpdatedTime >= dateSearch))).Count();
            var poSaleDelete = poSale.Where(x => x.IsDeleted && (string.IsNullOrEmpty(type) || (x.DeletedTime >= dateSearch))).Count();
            var poSalePeople = poSale.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.UpdatedBy) && (string.IsNullOrEmpty(type) || (x.UpdatedTime >= dateSearch))).GroupBy(x => new { UpdatedBy = !string.IsNullOrEmpty(x.UpdatedBy) ? x.UpdatedBy : "" }).Count();

            //HỢP ĐỒNG MUA
            var poBuyer = _context.PoBuyerHeaders;
            var poBuyerInsert = poBuyer.Where(x => !x.IsDeleted && string.IsNullOrEmpty(x.UpdatedBy) && (string.IsNullOrEmpty(type) || (x.CreatedTime >= dateSearch))).Count();
            var poBuyerUpdate = poBuyer.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.UpdatedBy) && (string.IsNullOrEmpty(type) || (x.UpdatedTime >= dateSearch))).Count();
            var poBuyerDelete = poBuyer.Where(x => x.IsDeleted && (string.IsNullOrEmpty(type) || (x.DeletedTime >= dateSearch))).Count();
            var poBuyerPeople = poBuyer.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.UpdatedBy) && (string.IsNullOrEmpty(type) || (x.UpdatedTime >= dateSearch))).GroupBy(x => new { UpdatedBy = !string.IsNullOrEmpty(x.UpdatedBy) ? x.UpdatedBy : "" }).Count();

            //NHÂN SỰ
            var employee = _context.HREmployees;
            var employeeInsert = employee.Where(x => x.flag.Equals(1) && x.updatetime == null && (string.IsNullOrEmpty(type) || (x.createtime >= dateSearch))).Count();
            var employeeUpdate = employee.Where(x => x.flag.Equals(1) && x.updatetime != null && (string.IsNullOrEmpty(type) || (x.updatetime >= dateSearch))).Count();
            var employeeDelete = employee.Where(x => !x.flag.Equals(1) && (string.IsNullOrEmpty(type) || (x.updatetime >= dateSearch))).Count();
            var employeePeople = employee.Where(x => x.flag.Equals(1) && !string.IsNullOrEmpty(x.updated_by) && (string.IsNullOrEmpty(type) || (x.updatetime >= dateSearch))).GroupBy(x => new { x.updated_by }).Count();

            //QUỸ TÀI CHÍNH
            var fund = _context.FundAccEntrys.Where(x => _context.FundCatReptExpss.Any(y => !y.IsDeleted && y.CatCode.Equals(x.CatCode)));
            var fundInsert = fund.Where(x => !x.IsDeleted && string.IsNullOrEmpty(x.UpdatedBy) && (string.IsNullOrEmpty(type) || (x.CreatedTime >= dateSearch))).Count();
            var fundUpdate = fund.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.UpdatedBy) && (string.IsNullOrEmpty(type) || (x.UpdatedTime >= dateSearch))).Count();
            var fundDelete = fund.Where(x => x.IsDeleted && (string.IsNullOrEmpty(type) || (x.DeletedTime >= dateSearch))).Count();
            var fundPeople = fund.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.UpdatedBy) && (string.IsNullOrEmpty(type) || (x.UpdatedTime >= dateSearch))).GroupBy(x => new { UpdatedBy = !string.IsNullOrEmpty(x.UpdatedBy) ? x.UpdatedBy : "" }).Count();

            //KHÁCH HÀNG
            var custommer = _context.Customerss;
            var custommerInsert = custommer.Where(x => !x.IsDeleted && string.IsNullOrEmpty(x.UpdatedBy) && (string.IsNullOrEmpty(type) || (x.CreatedTime >= dateSearch))).Count();
            var custommerUpdate = custommer.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.UpdatedBy) && (string.IsNullOrEmpty(type) || (x.UpdatedTime >= dateSearch))).Count();
            var custommerDelete = custommer.Where(x => x.IsDeleted && (string.IsNullOrEmpty(type) || (x.DeletedTime >= dateSearch))).Count();
            var custommerPeople = custommer.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.UpdatedBy) && (string.IsNullOrEmpty(type) || (x.UpdatedTime >= dateSearch))).GroupBy(x => new { UpdatedBy = !string.IsNullOrEmpty(x.UpdatedBy) ? x.UpdatedBy : "" }).Count();

            //NHÀ CUNG CẤP
            var supplier = _context.Suppliers;
            var supplierInsert = supplier.Where(x => !x.IsDeleted && string.IsNullOrEmpty(x.UpdatedBy) && (string.IsNullOrEmpty(type) || (x.CreatedTime >= dateSearch))).Count();
            var supplierUpdate = supplier.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.UpdatedBy) && (string.IsNullOrEmpty(type) || (x.UpdatedTime >= dateSearch))).Count();
            var supplierDelete = supplier.Where(x => x.IsDeleted && (string.IsNullOrEmpty(type) || (x.DeletedTime >= dateSearch))).Count();
            var supplierPeople = supplier.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.UpdatedBy) && (string.IsNullOrEmpty(type) || (x.UpdatedTime >= dateSearch))).GroupBy(x => new { UpdatedBy = !string.IsNullOrEmpty(x.UpdatedBy) ? x.UpdatedBy : "" }).Count();

            //KHO & VẬT TƯ THIẾT BỊ
            var materialProduct = _context.MaterialProducts.Select(x => new { x.Id, x.IsDeleted, x.CreatedBy, x.CreatedTime, x.UpdatedBy, x.UpdatedTime, x.DeletedBy }).ToList();
            var subProduct = _context.SubProducts.Select(p => new { p.Id, p.IsDeleted, p.CreatedBy, p.CreatedTime, p.UpdatedBy, p.UpdatedTime, p.DeletedBy }).ToList();
            var product = materialProduct.Union(subProduct);
            var productInsert = product.Where(x => !x.IsDeleted && string.IsNullOrEmpty(x.UpdatedBy) && (string.IsNullOrEmpty(type) || (x.CreatedTime >= dateSearch))).Count();
            var productUpdate = product.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.UpdatedBy) && (string.IsNullOrEmpty(type) || (x.UpdatedTime >= dateSearch))).Count();
            var productDelete = product.Where(x => x.IsDeleted && (string.IsNullOrEmpty(type) || (x.CreatedTime >= dateSearch))).Count();
            var productPeople = product.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.UpdatedBy) && (string.IsNullOrEmpty(type) || (x.UpdatedTime >= dateSearch))).GroupBy(x => new { UpdatedBy = !string.IsNullOrEmpty(x.UpdatedBy) ? x.UpdatedBy : "" }).Count();

            //ĐIỀU HÀNH CÔNG VIỆC
            var cardJob = _context.WORKOSCards;
            var cardJobInsert = cardJob.Where(x => !x.IsDeleted && string.IsNullOrEmpty(x.UpdatedBy) && (string.IsNullOrEmpty(type) || (x.CreatedDate >= dateSearch))).Count();
            var cardJobUpdate = cardJob.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.UpdatedBy) && (string.IsNullOrEmpty(type) || (x.UpdatedTime >= dateSearch))).Count();
            var cardJobDelete = cardJob.Where(x => x.IsDeleted && (string.IsNullOrEmpty(type) || (x.CreatedDate >= dateSearch))).Count();
            var cardJobPeople = cardJob.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.UpdatedBy) && (string.IsNullOrEmpty(type) || (x.UpdatedTime >= dateSearch))).GroupBy(x => new { UpdatedBy = !string.IsNullOrEmpty(x.UpdatedBy) ? x.UpdatedBy : "" }).Count();

            return new
            {
                projectInsert,
                projectUpdate,
                projectDelete,
                projectPeople,
                poInsert = poSaleInsert + poBuyerInsert,
                poUpdate = poSaleUpdate + poBuyerUpdate,
                poDelete = poSaleDelete + poBuyerDelete,
                poPeople = poSalePeople + poBuyerPeople,
                employeeInsert,
                employeeUpdate,
                employeeDelete,
                employeePeople,
                fundInsert,
                fundUpdate,
                fundDelete,
                fundPeople,
                custommerInsert,
                custommerUpdate,
                custommerDelete,
                custommerPeople,
                supplierInsert,
                supplierUpdate,
                supplierDelete,
                supplierPeople,
                productInsert,
                productUpdate,
                productDelete,
                productPeople,
                cardJobInsert,
                cardJobUpdate,
                cardJobDelete,
                cardJobPeople,
            };
        }

        [HttpPost]
        public JsonResult HighchartFunds()
        {
            //var year = DateTime.Now.Year;
            //var query = _context.FundAccEntrys.Where(x => !x.IsDeleted && x.CreatedTime.Value.Year.Equals(year) && _context.FundCatReptExpss.Any(p => !p.IsDeleted && p.CatCode.Equals(x.CatCode)))
            //    .Select(p => new { p.AetType, p.Total, Month = p.CreatedTime.Value.Month }).OrderBy(p => p.Month).GroupBy(x => new { x.AetType })
            //    .Select(p => new
            //    {
            //        name = p.First().AetType.Equals("Receipt") ? "Thu" : "Chi",
            //        data = p.Where(x => x.AetType.Equals(p.First().AetType)).GroupBy(i => i.Month).Select(z => new { month = z.First().Month, value = z.Sum(i => i.Total) })
            //    }).ToList();

            var query = _context.VHighchartFunds.GroupBy(x => new { x.Name }).Select(p => new
            {
                name = p.First().Name,
                data = p.Where(x => x.Name.Equals(p.First().Name)).GroupBy(i => i.Month).Select(z => new { month = z.First().Month, value = z.Sum(i => i.Total) }),
            }).AsNoTracking();

            return Json(query);
        }

        [HttpPost]
        public JsonResult HighchartProds()
        {
            //var year = DateTime.Now.Year;
            //var queryImport = _context.ProdReceivedDetails.Where(x => !x.IsDeleted && x.CreatedTime.Year.Equals(year))
            //    .Select(p => new { p.Quantity, p.QuantityIsSet, Month = p.CreatedTime.Month }).GroupBy(x => new { x.Month })
            //    .Select(p => new
            //    {
            //        Type = "Import",
            //        Month = p.First().Month,
            //        Total = p.Sum(y => y.Quantity),
            //    }).OrderBy(p => p.Month).ToList();

            //var queryExport = _context.ProdDeliveryDetails.Where(x => !x.IsDeleted && x.CreatedTime.Year.Equals(year))
            //    .Select(p => new { p.Quantity, Month = p.CreatedTime.Month }).GroupBy(x => new { x.Month })
            //    .Select(p => new
            //    {
            //        Type = "Export",
            //        Month = p.First().Month,
            //        Total = p.Sum(y => y.Quantity),
            //    }).OrderBy(p => p.Month).ToList();

            //var query = queryImport.Union(queryExport);
            //var rs = query.GroupBy(x => x.Type).Select(p => new
            //{
            //    name = p.First().Type.Equals("Import") ? "Nhập" : "Xuất",
            //    data = p.Where(x => x.Type.Equals(p.First().Type)).GroupBy(i => i.Month).Select(z => new { month = z.First().Month, value = z.Sum(i => i.Total) })
            //});

            var rs = _context.VHighchartProds.GroupBy(x => new { x.Name }).Select(p => new
            {
                name = p.First().Name,
                data = p.Where(x => x.Name.Equals(p.First().Name)).GroupBy(i => i.Month).Select(z => new { month = z.First().Month, value = z.Sum(i => i.Total) }),
            }).AsNoTracking();

            return Json(rs);
        }

        [HttpPost]
        public JsonResult HighchartAssets([FromBody]SearchAssetModel search)
        {
            var year = DateTime.Now.Year;
            year = !string.IsNullOrEmpty(search.Year) ? int.Parse(search.Year) : year;
            if (!string.IsNullOrEmpty(search.Department))
            {
                var assetAllow = (from a in _context.AssetAllocateHeaders.Where(x => !x.IsDeleted)
                                  join b in _context.AssetAllocateDetails.Where(x => !x.IsDeleted) on a.TicketCode equals b.TicketCode
                                  join c in _context.AssetMains.Where(x => !x.IsDeleted) on b.AssetCode equals c.AssetCode
                                  join d in _context.AssetTypes.Where(x => !x.IsDeleted) on c.AssetType equals d.CatCode
                                  where (string.IsNullOrEmpty(search.Department) || a.DepartmentReceive.Equals(search.Department))
                                  select new
                                  {
                                      d.CatCode
                                  });
                var query = (from a in _context.AssetTypes.Where(x => !x.IsDeleted)
                             join b in _context.AssetMains.Where(x => !x.IsDeleted && x.BuyedTime.HasValue && x.BuyedTime.Value.Year == year) on a.CatCode equals b.AssetType into b1
                             from b2 in b1.DefaultIfEmpty()
                             join c in assetAllow on a.CatCode equals c.CatCode
                             where (string.IsNullOrEmpty(search.Type) || a.CatCode.Equals(search.Type))
                             select new
                             {
                                 a.CatCode,
                                 a.CatName,
                                 Cost = b2.Cost != null ? b2.Cost : 0,
                                 b2.BuyedTime,
                             }).ToList();

                var rs = query.GroupBy(x => x.CatCode).Select(p => new
                {
                    name = p.First().CatName,
                    data = p.Where(k => k.BuyedTime != null).OrderBy(n => n.BuyedTime).GroupBy(i => i.BuyedTime.Value.Month).Select(y => new { month = y.First().BuyedTime.Value.Month, value = y.Sum(m => m.Cost) }),
                });

                if (rs.Where(x => x.data.Count() == 0).Count() == rs.Count())
                {
                    return Json(new List<object>());
                }
                else
                {
                    return Json(rs);
                }
            }
            else
            {
                string[] param = new string[] { "@yearData", "@type" };
                object[] val = new object[] { year, search.Type };
                DataTable query = _repositoryService.GetDataTableProcedureSql("P_HIGHCHART_ASSET", param, val);
                //var data = CommonUtil.ConvertDataTable<PChartModel>(rs).Select(p => new
                //{
                //    Status = p.Status,
                //    country = p.Country,
                //    litres = p.Litres,
                //}).OrderBy(p => p.Status);
                //var query = (from a in _context.AssetTypes.Where(x => !x.IsDeleted)
                //             join b in _context.AssetMains.Where(x => !x.IsDeleted && x.BuyedTime.HasValue && x.BuyedTime.Value.Year == year) on a.CatCode equals b.AssetType into b1
                //             from b2 in b1.DefaultIfEmpty()
                //             where (string.IsNullOrEmpty(search.Type) || a.CatCode.Equals(search.Type))
                //             select new
                //             {
                //                 a.CatCode,
                //                 a.CatName,
                //                 Cost = b2.Cost != null ? b2.Cost : 0,
                //                 b2.BuyedTime,
                //             }).ToList();

                //var rs = query.GroupBy(x => x.CatCode).Select(p => new
                //{
                //    name = p.First().CatName,
                //    data = p.Where(k => k.BuyedTime != null).OrderBy(n => n.BuyedTime).GroupBy(i => i.BuyedTime.Value.Month).Select(y => new { month = y.First().BuyedTime.Value.Month, value = y.Sum(m => m.Cost) }),
                //});

                var rs = CommonUtil.ConvertDataTable<PChartModel>(query).GroupBy(x => new { x.CatCode }).Select(p => new
                {
                    name = p.First().CatName,
                    data = p.Where(x => x.CatCode.Equals(p.First().CatCode)).GroupBy(i => i.Month).Select(z => new { month = z.First().Month, value = z.Sum(i => i.Value) }),
                });

                if (rs.Where(x => x.data.Count() == 0).Count() == rs.Count())
                {
                    return Json(new List<object>());
                }
                else
                {
                    return Json(rs);
                }
            }
        }

        [HttpPost]
        public JsonResult HighchartPieAssets([FromBody]SearchAssetModel search)
        {
            var year = DateTime.Now.Year;
            year = !string.IsNullOrEmpty(search.PieYear) ? int.Parse(search.PieYear) : year;
            //var assetUsed = (from a in _context.AssetAllocateDetails.Where(x => !x.IsDeleted && x.CreatedTime.Value.Year.Equals(year))
            //                 join b in _context.AssetMains.Where(x => !x.IsDeleted) on a.AssetCode equals b.AssetCode
            //                 select new
            //                 {
            //                     a.Quantity
            //                 }).Sum(x => x.Quantity);

            //var assetCancel = (from a in _context.AssetCancelDetails.Where(x => !x.IsDeleted && x.CreatedTime.Value.Year.Equals(year))
            //                   join b in _context.AssetMains.Where(x => !x.IsDeleted) on a.AssetName equals b.AssetCode
            //                   select new
            //                   {
            //                       a.QuantityAsset
            //                   }).Sum(x => x.QuantityAsset);

            //var assetRepair = (from a in _context.AssetMaintenanceDetailss.Where(x => !x.IsDeleted && x.CreatedTime.Value.Year.Equals(year))
            //                   join b in _context.AssetMains.Where(x => !x.IsDeleted) on a.AssetCode equals b.AssetCode
            //                   select new
            //                   {
            //                       a.AssetQuantity
            //                   }).Sum(x => x.AssetQuantity);

            //var total = assetUsed + assetCancel + assetRepair;
            //double percentAssetUsed = Math.Round(((double)assetUsed / (double)total) * 100, 1);
            //double percentAssetCancel = Math.Round(((double)assetCancel / (double)total) * 100, 1);
            //double percentAssetRepair = Math.Round(((double)assetRepair / (double)total) * 100, 1);

            //var item1 = new
            //{
            //    name = "Tài sản đang sử dụng",
            //    y = percentAssetUsed
            //};
            //var item2 = new
            //{
            //    name = "Tài sản hủy",
            //    y = percentAssetCancel
            //};
            //var item3 = new
            //{
            //    name = "Tài sản sửa chữa",
            //    y = percentAssetRepair
            //};

            //var list = new List<object>()
            //{
            //    item1,
            //    item2,
            //    item3
            //};

            string[] param = new string[] { "@yearData" };
            object[] val = new object[] { year };
            DataTable query = _repositoryService.GetDataTableProcedureSql("P_HIGHCHART_PIE_ASSET", param, val);
            var rs = CommonUtil.ConvertDataTable<PChartModel>(query).Select(x => new { name = x.Name, y = x.PercentData });

            if (rs.Count() == 0)
                return Json(new List<object>());
            else
                return Json(rs);
        }

        [HttpPost]
        public object JTableSystemLog([FromBody]JTableModelCustom jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var count = 0;
            var query = new List<SystemLog>();

            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            //Tìm kiếm theo ngày tạo
            var fromDatePara = fromDate.HasValue ? fromDate.Value.ToString("yyyy-MM-dd") : "";
            var toDatePara = toDate.HasValue ? toDate.Value.ToString("yyyy-MM-dd") : "";


            string[] param = new string[] { "@pageNo", "@pageSize", "@departmentCode", "@groupUserCode", "@userName", "@fromDate", "@toDate" };
            object[] val = new object[] { jTablePara.CurrentPage, jTablePara.Length, jTablePara.DepartmentCode, jTablePara.GroupUserCode, jTablePara.UserName, fromDatePara, toDatePara };
            DataTable rs = _repositoryService.GetDataTableProcedureSql("P_SYSTEM_LOG_VIEW", param, val);
            query = CommonUtil.ConvertDataTable<SystemLog>(rs);
            if (query.Any())
            {
                count = int.Parse(query.FirstOrDefault().TotalRow);
                var jdata = JTableHelper.JObjectTable(query, jTablePara.Draw, count, "Id", "Name", "Controller", "Action", "RequestBody", "IP", "CreatedBy", "GivenName", "TotalRow", "CreatedTime");
                return Json(jdata);
            }
            else
            {
                var jdata = JTableHelper.JObjectTable(query, jTablePara.Draw, 0, "Id", "Name", "Controller", "Action", "RequestBody", "IP", "CreatedBy", "GivenName", "TotalRow", "CreatedTime");
                return Json(jdata);
            }
        }
        #endregion
        #region Map
        public class SearchMap
        {
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string UserName { get; set; }
        }
        public class WorkSession
        {
            public int Id { get; set; }
            public string CheckTitle { get; set; }
        }
        [HttpPost]
        public JsonResult GetRouteInOut([FromBody]SearchMap search)
        {
            var today = DateTime.Now;
            var fromDate = !string.IsNullOrEmpty(search.FromDate) ? DateTime.ParseExact(search.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(search.ToDate) ? DateTime.ParseExact(search.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            List<ResumRouteInOut> resum = new List<ResumRouteInOut>();
            var data = from a in _context.ShiftLogs
                       where ((fromDate == null) || (a.ChkinTime.Value.Date >= fromDate.Value.Date))
                       //&& ((toDate == null) || ((a.ChkoutTime.HasValue ? a.ChkoutTime.Value.Date : today.Date) <= toDate.Value.Date))
                       && (string.IsNullOrEmpty(search.UserName) || a.CreatedBy.Equals(search.UserName))
                       group a by a.CreatedBy into g
                       select g;
            var DataTracking = _context.UserTrackingGpss.FirstOrDefault(x => x.UserName == search.UserName && x.TrackingDate.Value.Date == fromDate.Value.Date);
            foreach (var item in data)
            {
                var shifts = item.ToList();
                List<RouteInOut> routes = new List<RouteInOut>();
                foreach (var shif in shifts)
                {
                    if (shif.ChkinTime.HasValue)
                    {
                        var routeInOut = new RouteInOut
                        {
                            Action = "In",
                            Address = shif.ChkinLocationTxt,
                            Time = shif.ChkinTime.Value.ToString("HH:mm:ss dd/MM/yyyy"),
                            LatLng = shif.ChkinLocationGps,
                            listItemActivity = (from c in _context.WORKItemSessionResults
                                                join d in _context.SessionItemChkItems on c.WorkSession equals d.Session
                                                join e in _context.CardItemChecks on d.Item equals e.ChkListCode
                                                join f in _context.ShiftLogs on c.ShiftCode equals f.ShiftCode
                                                where f.ShiftCode.Equals(shif.ShiftCode) && c.IsDeleted == false
                                                select new WorkSession
                                                {
                                                    Id = e.Id,
                                                    CheckTitle = e.CheckTitle,
                                                }).DistinctBy(x => x.Id).ToList(),

                        };
                        routes.Add(routeInOut);
                    }
                    if (shif.ChkoutTime.HasValue)
                    {
                        var routeInOut = new RouteInOut
                        {
                            Action = "Out",
                            Address = shif.ChkoutLocationTxt,
                            Time = shif.ChkoutTime.Value.ToString("HH:mm:ss dd/MM/yyyy"),
                            LatLng = shif.ChkoutLocationGps,
                            listItemActivity = (from c in _context.WORKItemSessionResults
                                                join d in _context.SessionItemChkItems on c.WorkSession equals d.Session
                                                join e in _context.CardItemChecks on d.Item equals e.ChkListCode
                                                join f in _context.ShiftLogs on c.ShiftCode equals f.ShiftCode
                                                where c.ShiftCode.Equals(shif.ShiftCode) && c.IsDeleted == false
                                                select new WorkSession
                                                {
                                                    Id = e.Id,
                                                    CheckTitle = e.CheckTitle,
                                                }).DistinctBy(x => x.Id).ToList(),
                        };
                        routes.Add(routeInOut);
                    }
                }
                var resumRoute = new ResumRouteInOut
                {
                    UserName = item.Key,
                    RouteInOuts = routes,
                    DataGps = DataTracking != null ? DataTracking.DataGps : ""
                };
                resum.Add(resumRoute);
            }
            return Json(resum);
        }
        public class RouteInOut
        {
            public string Action { get; set; }
            public string Address { get; set; }
            public string Time { get; set; }
            public string LatLng { get; set; }
            public List<WorkSession> listItemActivity { get; set; }

        }
        public class ResumRouteInOut
        {
            public string UserName { get; set; }
            public string DataGps { get; set; }
            public List<RouteInOut> RouteInOuts { get; set; }
        }
        #endregion

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_assetAllocationController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_assetBuyController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_assetCancelController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_assetImprovementController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_assetInventoryController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_assetLiquidationController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_assetMaintenanceController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_assetRecalledController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_assetRPTBrokenController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_assetRqMaintenanceRepairController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_assetTransferController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_cardJobController.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion
        #region Object
        public class TimePieModel
        {
            public string TimePieBuy { get; set; }
        }

        public class SearchAssetModel
        {
            public string Type { get; set; }
            public string Department { get; set; }
            public string Year { get; set; }
            public string PieYear { get; set; }
        }

        public class SystemLog
        {
            public int Id { get; set; }
            public string Name { get; set; }
            public string Controller { get; set; }
            public string Action { get; set; }
            public string RequestBody { get; set; }
            public string IP { get; set; }
            public string CreatedBy { get; set; }
            public string GivenName { get; set; }
            public string TotalRow { get; set; }
            public string CreatedTime { get; set; }
        }
        public class ProjectManagementJtable : JTableModel
        {
            public string UserId { get; set; }
            public string Code { get; set; }
            public string Name { get; set; }
            public string Status { get; set; }
            public string DueDate { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
        }
        public class AssetJtable : JTableModel
        {
            public string UserId { get; set; }
            public string Code { get; set; }
            public string Name { get; set; }
            public string Status { get; set; }
        }
        public class CMSItemsJTableModel : JTableModel
        {
            public int Id { get; set; }
            public string Title { get; set; }
            public string PostFromDate { get; set; }
            public string PostToDate { get; set; }
            public string CreFromDate { get; set; }
            public string CreToDate { get; set; }
            public int? Category { get; set; }
            public bool? Status { get; set; }
            public int? TypeItem { get; set; }

        }
        public class CardNotifi
        {
            public int CardID { get; set; }
            public string CardCode { get; set; }
            public string CardName { get; set; }
            public DateTime BeginTime { get; set; }
            public DateTime? EndTime { get; set; }
            public string ListUserView { get; set; }
            public string ListName { get; set; }
            public string BoardName { get; set; }
            public string Status { get; set; }
            public string ProjectName { get; set; }
            public string ContractName { get; set; }
            public string UpdatedTimeTxt { get; set; }
            public string WorkType { get; set; }
            public string Priority { get; set; }
        }

        #endregion
    }
}