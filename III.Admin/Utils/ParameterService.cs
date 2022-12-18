using ESEIM.Models;
using III.Domain.Enums;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using static ESEIM.Utils.ParameterService;
using static III.Admin.Controllers.CardJobController;

namespace ESEIM.Utils
{
    public interface IParameterService
    {
        int GetPagingLength();
        int GetCountNotification();
        int GetIncommingDocumentPending(string userId);
        int GetOutDocumentPending(string userId);
        int GetCountCandidateInterview();
        int GetCountWarning();
        int GetCountCalendarCandidate();
        int GetCountNotifiCardJob(string userId, string uName);
        double GetSessionTimeout();
        bool CheckAuthority(string userId);
        Task<string> GetPicter(string userId);
        int GetNotificationAssetAllocate(string role, string branch, List<string> depart);
        int GetCMSItemToday();
        int GetCountNotificationProject(string userId);
        int GetCountNotificationContract(string userId);
        int GetCountNotificationContractPO(string userId);
        int GetCountNotificationSupplier(string userId);
        int GetCountNotificationCustomer(string userId);
        ShiftLogTemp GetLastShiftLog(string uName);
        List<RoomInfo> GetListRoom(SessionUserLogin session);
        CountInOutAndOnline GetCountCheckInAndOnline();
        List<UserChat> GetListUser();
    }

    public class ParameterService : IParameterService
    {
        private EIMDBContext _context;

        public ParameterService(EIMDBContext context)
        {
            _context = context;
        }
        public int GetPagingLength()
        {
            var para = _context.CommonSettings.SingleOrDefault(x => x.CodeSet == "NUM_PER_PAGE");
            int paging;
            if (para == null || !int.TryParse(para.ValueSet, out paging) || paging <= 0)
                paging = 10;
            return paging;
        }
        public int GetCountNotification()
        {
            int notification = _context.Notifications.Where(x => !x.IsDeleted).Count();
            return notification;
        }
        public int GetCountWarning()
        {
            try
            {
                var dataExpense = (from a in _context.FundAccEntrys.Where(x => x.IsDeleted == false && x.IsPlan == false && x.AetType == "Expense" && x.IsCompleted == true)
                                   join b in _context.FundAccEntryTrackings.Where(x => x.IsDeleted == false && x.Action == "APPROVED")
                                   on a.AetCode equals b.AetCode
                                   select new
                                   {
                                       a.CatCode,
                                       a.AetType,
                                       a.AetCode,
                                       a.DeadLine,
                                       a.Payer,
                                       a.Receiptter,
                                       Total = (a.Currency == "VND" || a.Currency == "VNĐ") ? a.Total : (a.Total * ((1 / _context.FundExchagRates.FirstOrDefault(x => x.Currency == a.Currency).Rate) * _context.FundExchagRates.FirstOrDefault(x => x.Currency == "VND").Rate)),


                                   }).ToList();
                var dataExpense1 = (from a in dataExpense
                                    join b in _context.ParamForWarnings.Where(x => x.isDeleted == false && x.aetType == "Expense")
                                    on a.CatCode equals b.catCode
                                    where a.DeadLine >= b.fromTime && a.DeadLine <= b.toTime
                                    group a by new { a.CatCode, a.AetType }
                            into list
                                    orderby list.Key.CatCode
                                    select new
                                    {
                                        list,
                                        total = list.Sum(x => x.Total),
                                        catCode = list.Key.CatCode,
                                        aetType = list.Key.AetType,
                                        maxDate = list.Max(x => x.DeadLine),
                                        minDate = list.Min(x => x.DeadLine),

                                    }).ToList();
                var queryExpense = (from a in dataExpense1.Where(x => x.aetType == "Expense")
                                    join b in _context.ParamForWarnings.Where(x => x.isDeleted == false && x.aetType == "Expense")
                                    on a.catCode equals b.catCode
                                    where a.maxDate <= b.toTime && a.minDate >= b.fromTime && a.total >= b.total
                                    select new
                                    {
                                        id = b.id,
                                        maxTotal = b.total,
                                        fromDate = b.fromTime,
                                        toDate = b.toTime,
                                        aetType = b.aetType,
                                        catCode = b.catCode,
                                        currency = b.currency,
                                        total = a.total,
                                    }).ToList();
                var dataReceipt = (from a in _context.FundAccEntrys.Where(x => x.IsDeleted == false && x.IsPlan == false && x.AetType == "Receipt" && x.IsCompleted == true)
                                   join b in _context.FundAccEntryTrackings.Where(x => x.IsDeleted == false && x.Action == "APPROVED")
                                   on a.AetCode equals b.AetCode
                                   select new
                                   {
                                       a.CatCode,
                                       a.AetType,
                                       a.AetCode,
                                       a.DeadLine,
                                       a.Payer,
                                       a.Receiptter,
                                       Total = (a.Currency == "VND" || a.Currency == "VNĐ") ? a.Total : (a.Total * ((1 / _context.FundExchagRates.FirstOrDefault(x => x.Currency == a.Currency).Rate) * _context.FundExchagRates.FirstOrDefault(x => x.Currency == "VND").Rate)),

                                   }).ToList();
                var dataReceipt1 = (from a in dataReceipt
                                    join b in _context.ParamForWarnings.Where(x => x.isDeleted == false && x.aetType == "Receipt")
                             on a.CatCode equals b.catCode
                                    where a.DeadLine >= b.fromTime && a.DeadLine <= b.toTime
                                    group a by new { a.CatCode, a.AetType }
                            into list
                                    orderby list.Key.CatCode
                                    select new
                                    {
                                        list,

                                        total = list.Sum(x => x.Total),
                                        catCode = list.Key.CatCode,
                                        aetType = list.Key.AetType,
                                        maxDate = list.Max(x => x.DeadLine),
                                        minDate = list.Min(x => x.DeadLine),

                                    }).ToList();
                var queryReceipt = (from a in dataReceipt1.Where(x => x.aetType == "Receipt")
                                    join b in _context.ParamForWarnings.Where(x => x.isDeleted == false && x.aetType == "Receipt")
                                    on a.catCode equals b.catCode
                                    where a.maxDate <= b.toTime && a.minDate >= b.fromTime && a.total >= b.total
                                    select new
                                    {
                                        id = b.id,
                                        maxTotal = b.total,
                                        fromDate = b.fromTime,
                                        toDate = b.toTime,
                                        aetType = b.aetType,
                                        catCode = b.catCode,
                                        currency = b.currency,
                                        total = a.total,

                                    }).ToList();
                return queryReceipt.Count() + queryExpense.Count();

            }
            catch (Exception)
            {
                return 0;
            }
        }
        public int GetCountCandidateInterview()
        {
            var dateNow = DateTime.Now;
            var count = (from a in _context.CandidateInterviews
                         where a.InterviewDate > dateNow
                         select new
                         {
                             a
                         }).AsNoTracking().Count();
            return count;
        }
        public int GetCountCalendarCandidate()
        {
            var today = DateTime.Today;
            var count = (from a in _context.CandiateBasic
                         where a.CreatedTime.Date >= today.Date
                         select new
                         {
                             a
                         }).AsNoTracking().Count();
            return count;
        }
        public int GetIncommingDocumentPending(string userId)
        {
            var inBoxType = EnumHelper<DocumentTypeEnum>.GetDisplayValue(DocumentTypeEnum.InBoxType);
            var count = (from a in _context.DispatchesHeaders
                         from b in _context.DispatchTrackingProcesss.Where(o => o.DispatchCode == a.DispatchCode).Take(1)
                         join c in _context.DispatchesMemberActivitys on b.ProcessCode equals c.ProcessCode
                         where a.Type == inBoxType && c.UserId == userId && c.AssigneeConfirm != EnumHelper<DocumentStatusEnum>.GetDisplayValue(DocumentStatusEnum.Done)
                         && c.AssigneeConfirm != EnumHelper<DocumentStatusEnum>.GetDisplayValue(DocumentStatusEnum.Send)
                         && c.AssigneeConfirm != EnumHelper<DocumentStatusEnum>.GetDisplayValue(DocumentStatusEnum.SendCoordinated)
                         && c.AssigneeConfirm != EnumHelper<DocumentStatusEnum>.GetDisplayValue(DocumentStatusEnum.Coordinated)
                         && (c.Role != DocumentRoleEnum.ReView.GetHashCode() || (c.AssigneeConfirm != EnumHelper<DocumentStatusEnum>.GetDisplayValue(DocumentStatusEnum.Review) && c.Role == DocumentRoleEnum.ReView.GetHashCode()))
                         select a).AsNoTracking().DistinctBy(x => x.Id).Count();
            return count;
        }
        public int GetOutDocumentPending(string userId)
        {
            var outBoxType = EnumHelper<DocumentTypeEnum>.GetDisplayValue(DocumentTypeEnum.OBT);
            var count = (from a in _context.DispatchesHeaders
                         from b in _context.DispatchTrackingProcesss.Where(o => o.DispatchCode == a.DispatchCode).Take(1)
                         join c in _context.DispatchesMemberActivitys on b.ProcessCode equals c.ProcessCode
                         where a.Type == outBoxType && c.UserId == userId && c.AssigneeConfirm != (EnumHelper<DocumentStatusEnum>.GetDisplayValue(DocumentStatusEnum.Review))
                         select new
                         {
                             a.Id,
                         }).AsNoTracking().DistinctBy(x => x.Id).Count();
            return count;
        }
        public bool CheckAuthority(string userId)
        {
            bool isValid = false;
            var checkAuthority = _context.AdAuthorings.FirstOrDefault(x => x.ToUser == userId && x.Confirm == "N");
            if (checkAuthority != null)
            {
                isValid = true;
            }
            return isValid;
        }
        public double GetSessionTimeout()
        {
            //var para = _context.VIBParameter.SingleOrDefault(x => x.ParameterCode == "SYSTEM_SESSION_TIMEOUT");
            double timeout;
            /* if (para == null || !double.TryParse(para.Value, out timeout) || timeout <= 0)*/
            timeout = 60; // Minutes
            return timeout;
        }
        public async Task<string> GetPicter(string userId)
        {
            string url = "";
            var user = await _context.Users.FirstOrDefaultAsync(x => x.Id == userId);
            if (user != null)
            {
                url = user.Picture;
            }
            return url;
        }
        public int GetCountNotifiCardJob(string userId, string uName)
        {
            var query = (from a in _context.WORKOSCards.Where(x => !x.IsDeleted && x.Status != "TRASH" && x.Status != "CANCLED")
                         join b in _context.Users on a.CreatedBy equals b.UserName into b1
                         from b2 in b1.DefaultIfEmpty()
                         where (a.CreatedBy == uName || a.LstUser.Contains(userId))
                         && (string.IsNullOrEmpty(a.ListUserView) || !a.ListUserView.Contains(userId))
                         select new
                         {
                             a.CardID,
                             a.CardCode
                         }).DistinctBy(x => x.CardCode);

            //var query = (from a in _context.WORKOSCards.Where(x => !x.IsDeleted && x.Status != "TRASH" && x.Status != "CANCLED")
            //             join e in _context.CardMappings on a.CardCode equals e.CardCode
            //             where (e.UserId == userId) || (a.CreatedBy == uName)
            //             select new
            //             {
            //                 CardCode = a.CardCode,
            //                 a.ListUserView
            //             }).DistinctBy(x => x.CardCode);
            //var count = 0;
            //foreach (var item in query)
            //{
            //    if (string.IsNullOrEmpty(item.ListUserView))
            //    {
            //        count += 1;
            //    }
            //    else
            //    {
            //        if (!item.ListUserView.Contains(userId))
            //        {
            //            count += 1;
            //        }
            //    }
            //}
            return query.Count();
        }
        public int GetNotificationAssetAllocate(string role, string branch, List<string> depart)
        {
            var query = (from a in _context.AssetAllocateHeaders.Where(x => !x.IsDeleted && x.Status == "ASSET_CREATE")
                         join b in _context.WorkflowActivityRoles.Where(x => !x.IsDeleted && x.Role == role
                         && x.BranchCode == branch && depart.Any(k => k == x.DepartCode)) on a.ObjActCode equals b.WorkFlowCode
                         select new
                         {
                             ID = a.ID,
                             Code = a.TicketCode,
                         }).Union(
                from a in _context.AssetLiquidationHeaders.Where(x => !x.IsDeleted && x.Status == "ASSET_CREATE")
                join b in _context.WorkflowActivityRoles.Where(x => !x.IsDeleted && x.Role == role
                && x.BranchCode == branch && depart.Any(k => k == x.DepartCode)) on a.ObjActCode equals b.WorkFlowCode
                select new
                {
                    ID = a.ID,
                    Code = a.TicketCode,
                }).Union(
                from a in _context.AssetBuyHeaders.Where(x => !x.IsDeleted && x.Status == "ASSET_CREATE")
                join b in _context.WorkflowActivityRoles.Where(x => !x.IsDeleted && x.Role == role
                && x.BranchCode == branch && depart.Any(k => k == x.DepartCode)) on a.ObjActCode equals b.WorkFlowCode
                select new
                {
                    ID = a.ID,
                    Code = a.TicketCode,
                }).Union(
                from a in _context.AssetInventoryHeaders.Where(x => !x.IsDeleted && x.Status == "ASSET_CREATE")
                join b in _context.WorkflowActivityRoles.Where(x => !x.IsDeleted && x.Role == role
                && x.BranchCode == branch && depart.Any(k => k == x.DepartCode)) on a.ObjActCode equals b.WorkFlowCode
                select new
                {
                    ID = a.AssetID,
                    Code = a.TicketCode,
                }).Union(
                from a in _context.AssetTransferHeaders.Where(x => !x.IsDeleted && x.Status == "ASSET_CREATE")
                join b in _context.WorkflowActivityRoles.Where(x => !x.IsDeleted && x.Role == role
                && x.BranchCode == branch && depart.Any(k => k == x.DepartCode)) on a.ObjActCode equals b.WorkFlowCode
                select new
                {
                    ID = a.AssetID,
                    Code = a.Ticketcode,
                }).Union(
                from a in _context.AssetRPTBrokenHeaders.Where(x => !x.IsDeleted && x.AssetStatus == "ASSET_CREATE")
                join b in _context.WorkflowActivityRoles.Where(x => !x.IsDeleted && x.Role == role
                && x.BranchCode == branch && depart.Any(k => k == x.DepartCode)) on a.ObjActCode equals b.WorkFlowCode
                select new
                {
                    ID = a.AssetID,
                    Code = a.TicketCode,
                }).Union(
                from a in _context.AssetRqMaintenanceRepairHeaders.Where(x => !x.IsDeleted && x.Status == "ASSET_CREATE")
                join b in _context.WorkflowActivityRoles.Where(x => !x.IsDeleted && x.Role == role
                && x.BranchCode == branch && depart.Any(k => k == x.DepartCode)) on a.ObjActCode equals b.WorkFlowCode
                select new
                {
                    ID = a.ID,
                    Code = a.TicketCode,
                }).Union(
                from a in _context.AssetRecalledHeaders.Where(x => !x.IsDeleted && x.Status == "ASSET_CREATE")
                join b in _context.WorkflowActivityRoles.Where(x => !x.IsDeleted && x.Role == role
                && x.BranchCode == branch && depart.Any(k => k == x.DepartCode)) on a.ObjActCode equals b.WorkFlowCode
                select new
                {
                    ID = a.ID,
                    Code = a.TicketCode,
                }).Union(
                from a in _context.AssetMaintenanceHeaders.Where(x => !x.IsDeleted && x.Status == "ASSET_CREATE")
                join b in _context.WorkflowActivityRoles.Where(x => !x.IsDeleted && x.Role == role
                && x.BranchCode == branch && depart.Any(k => k == x.DepartCode)) on a.ObjActCode equals b.WorkFlowCode
                select new
                {
                    ID = a.TicketID,
                    Code = a.TicketCode,
                }).Union(
                from a in _context.AssetCancelHeaders.Where(x => !x.IsDeleted && x.Status == "ASSET_CREATE")
                join b in _context.WorkflowActivityRoles.Where(x => !x.IsDeleted && x.Role == role
                && x.BranchCode == branch && depart.Any(k => k == x.DepartCode)) on a.ObjActCode equals b.WorkFlowCode
                select new
                {
                    ID = a.AssetID,
                    Code = a.TicketCode,
                }).Union(
                from a in _context.AssetImprovementHeaders.Where(x => !x.IsDeleted && x.Status == "ASSET_CREATE")
                join b in _context.WorkflowActivityRoles.Where(x => !x.IsDeleted && x.Role == role
                && x.BranchCode == branch && depart.Any(k => k == x.DepartCode)) on a.ObjActCode equals b.WorkFlowCode
                select new
                {
                    ID = a.TicketID,
                    Code = a.TicketCode,
                    
                });
            return query.Count();
        }
        public int GetCMSItemToday()
        {
            var today = DateTime.Today;
            var query = from a in _context.cms_items
                        join b in _context.cms_categories on a.cat_id equals b.id
                        where a.date_post.Value.Date == today && a.published == true && b.published == true
                        select new
                        {
                            a.id
                        };
            return query.Count();
        }
        public int GetCountNotificationProject(string userId)
        {
            var projects = _context.Projects.Where(x => !x.FlagDeleted);
            var count = 0;
            foreach (var item in projects)
            {
                if (!string.IsNullOrEmpty(item.ListUserView))
                {
                    if (!item.ListUserView.Contains(userId))
                    {
                        count += 1;
                    }
                }
                else
                {
                    count += 1;
                }
            }
            return count;
        }
        public int GetCountNotificationContract(string userId)
        {
            var contract = _context.PoSaleHeaders.Where(x => !x.IsDeleted);
            var countContract = 0;
            foreach (var item in contract)
            {
                if (!string.IsNullOrEmpty(item.ListUserView))
                {
                    if (!item.ListUserView.Contains(userId))
                    {
                        countContract += 1;
                    }
                }
                else
                {
                    countContract += 1;
                }
            }
            return countContract;
        }
        public int GetCountNotificationContractPO(string userId)
        {
            var contractPo = _context.PoBuyerHeaders.Where(x => !x.IsDeleted);
            var countContractPo = 0;
            foreach (var item in contractPo)
            {
                if (!string.IsNullOrEmpty(item.ListUserView))
                {
                    if (!item.ListUserView.Contains(userId))
                    {
                        countContractPo += 1;
                    }
                }
                else
                {
                    countContractPo += 1;
                }
            }
            return countContractPo;
        }
        public int GetCountNotificationSupplier(string userId)
        {
            var supplier = _context.Suppliers.Where(x => !x.IsDeleted);
            var countSupplier = 0;
            foreach (var item in supplier)
            {
                if (!string.IsNullOrEmpty(item.ListUserView))
                {
                    if (!item.ListUserView.Contains(userId))
                    {
                        countSupplier += 1;
                    }
                }
                else
                {
                    countSupplier += 1;
                }
            }
            return countSupplier;
        }
        public int GetCountNotificationCustomer(string userId)
        {
            var customer = _context.Customerss.Where(x => !x.IsDeleted);
            var countCustomer = 0;
            foreach (var item in customer)
            {
                if (!string.IsNullOrEmpty(item.ListUserView))
                {
                    if (!item.ListUserView.Contains(userId))
                    {
                        countCustomer += 1;
                    }
                }
                else
                {
                    countCustomer += 1;
                }
            }
            return countCustomer;
        }

        public CountInOutAndOnline GetCountCheckInAndOnline()
        {
            var toDay = DateTime.Now;
            var countCheckIn = _context.ShiftLogs.Where(x => x.ChkinTime.Value.Date == toDay.Date && !x.ChkoutTime.HasValue).DistinctBy(x => x.CreatedBy).Count();
            var countOnline = _context.Users.Where(x => x.IsOnline == 1 && x.Active).Count();
            var countUser = _context.Users.Where(x => x.Active).Count();
            var count = new CountInOutAndOnline
            {
                CountIn = countCheckIn,
                CountOnline = countOnline,
                CountAll= countUser
            };
            return count;
        }
        public ShiftLogTemp GetLastShiftLog(string userName)
        {
            var shiftTemp = new ShiftLogTemp();
            var data = _context.ShiftLogs.LastOrDefault(x => x.CreatedBy == userName && x.Flag != "DELETED" && x.Flag != "CANCEL");
            if (data != null)
            {

                shiftTemp.ShiftCode = data.ShiftCode;
                shiftTemp.ChkoutTime = data.ChkoutTime;
                shiftTemp.ChkinTime = data.ChkinTime;
                shiftTemp.ChkinLocationTxt = data.ChkinLocationTxt;
                shiftTemp.ChkoutLocationTxt = data.ChkoutLocationTxt;
                if (data.ChkoutTime == null)
                    shiftTemp.IsCheckIn = true;
            }
            else
            {
                shiftTemp.IsCheckIn = false;
            }
            return shiftTemp;
        }

        public List<RoomInfo> GetListRoom(SessionUserLogin session)
        {
            var rs = new List<RoomInfo>();
            try
            {
                rs = (from a in _context.ZoomManages.Where(x => !x.IsDeleted)
                      join b in _context.Users.Where(x => x.Active) on a.CreatedBy equals b.UserName
                      orderby a.Id
                      select new RoomInfo
                      {
                          RoomID = a.ZoomId,
                          RoomName = a.ZoomName,
                          RoomPassWord = a.ZoomPassword,
                          UserName = session.FullName,
                          CreatedBy = b.GivenName,
                          CreatedTime = a.CreatedTime.Value.ToString("HH:mm dd/MM/yyyy"),
                          Role = session.UserName.Equals(a.CreatedBy) ? 10 : 0,
                          Group = a.Group,
                          AccountZoom = a.AccountZoom,
                          ListUserAccess = a.ListUserAccess,
                          IsEdit = session.Email.Equals(a.AccountZoom) ? true : false,
                      }).ToList();
            }
            catch (Exception ex)
            {

            }
            return rs;
        }

        public List<UserChat> GetListUser()
        {
            var query = _context.Users.Where(x => x.Active == true && x.UserName != "admin")
                .Select(x => new UserChat { UserId = x.Id, GivenName = x.GivenName, Avatar = x.Picture, UserName = x.UserName, GroupUserCode = x.AdUserInGroups.Select(y => y.GroupUserCode).FirstOrDefault() }).AsNoTracking();
            return query.ToList();
        }

        public class UserChat
        {
            public string UserId { get; set; }
            public string UserName { get; set; }
            public string GivenName { get; set; }
            public string Avatar { get; set; }
            public string GroupUserCode { get; set; }
        }

        public class ObjNotification
        {
            public string ObjType { get; set; }
            public string ObjCode { get; set; }
            public string ObjName { get; set; }
        }
        public class CountInOutAndOnline
        {
            public int CountIn { get; set; }
            public int CountOnline { get; set; }
            public int CountAll { get; set; }
        }
        public class ShiftLogTemp
        {
            public int Id { get; set; }
            public string ShiftCode { get; set; }
            public DateTime? ChkinTime { get; set; }
            public string ChkinLocationTxt { get; set; }
            public string ChkinLocationGps { get; set; }
            public string ChkinPicRealtime { get; set; }
            public bool IsChkinRealtime { get; set; }
            public DateTime? ChkoutTime { get; set; }
            public string ChkoutLocationTxt { get; set; }
            public string ChkoutLocationGps { get; set; }
            public string ChkoutPicRealtime { get; set; }
            public bool IsChkoutReadtime { get; set; }
            public string Note { get; set; }
            public string CreatedBy { get; set; }
            public DateTime? CreatedTime { get; set; }
            public string UpdatedBy { get; set; }
            public DateTime? UpdatedTime { get; set; }
            public string Flag { get; set; }
            public string FromDevice { get; set; }
            public string Ip { get; set; }
            public string Imei { get; set; }
            public bool IsCheckIn { get; set; }
        }
        public class RoomInfo
        {
            public string RoomID { get; set; }
            public string RoomName { get; set; }
            public string RoomPassWord { get; set; }
            public string UserName { get; set; }
            public string CreatedBy { get; set; }
            public string CreatedTime { get; set; }
            public string AccountZoom { get; set; }
            public string Group { get; set; }
            public int? Role { get; set; }
            public string ListUserAccess { get; set; }
            public bool IsEdit { get; set; }
        }
    }
}
