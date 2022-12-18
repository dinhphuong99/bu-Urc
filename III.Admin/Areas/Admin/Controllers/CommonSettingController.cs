using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using III.Domain.Enums;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;

namespace III.Admin.Controllers
{
    public class CommonSettingGroupModel
    {
        public string AssetCode { get; set; }
        public string Group { get; set; }
        public string GroupNote { get; set; }
        public string Type { get; set; }
        public DateTime? CreatedTime { get; set; }
    }

    public class DataType
    {
        public string Code { get; set; }
        public string Name { get; set; }
    }
    [Area("Admin")]
    public class CommonSettingController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IStringLocalizer<CommonSettingController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public CommonSettingController(EIMDBContext context, IStringLocalizer<CommonSettingController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }
        public IActionResult Index()
        {
            return View();
        }
        public class JTableModelSetting : JTableModel
        {
            public string SettingCode { get; set; }
            public string SettingValue { get; set; }
            public string SettingGroup { get; set; }
        }
        [HttpPost]
        public object JTableEmployee([FromBody]JTableModelSetting jTablePara)
        {
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = GetGroup(EnumHelper<EmployeeEnum>.GetDisplayValue(EmployeeEnum.Employee));
            int count = query.Count();
            var data = query.Skip(intBegin).Take(jTablePara.Length).ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Group", "GroupNote", "CreatedTime");
            return Json(jdata);
        }
        public object JTableCMS([FromBody]JTableModelSetting jTablePara)
        {
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = GetGroup(EnumHelper<CMSEnum>.GetDisplayValue(CMSEnum.CMS));
            int count = query.Count();
            var data = query.Skip(intBegin).Take(jTablePara.Length).ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Group", "GroupNote", "CreatedTime");
            return Json(jdata);
        }
        [HttpPost]
        public object JTableContract([FromBody]JTableModelSetting jTablePara)
        {
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = GetGroup(EnumHelper<ContractEnum>.GetDisplayValue(ContractEnum.Contract));
            int count = query.Count();
            var data = query.Skip(intBegin).Take(jTablePara.Length).ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Group", "GroupNote", "CreatedTime");
            return Json(jdata);
        }

        [HttpPost]
        public object JTableProject([FromBody]JTableModelSetting jTablePara)
        {
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = GetGroup(EnumHelper<ProjectEnum>.GetDisplayValue(ProjectEnum.Project));
            int count = query.Count();
            var data = query.Skip(intBegin).Take(jTablePara.Length).ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Group", "GroupNote", "CreatedTime");
            return Json(jdata);
        }

        [HttpPost]
        public object JTableSupplier([FromBody]JTableModelSetting jTablePara)
        {
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = GetGroup(EnumHelper<SupplierEnum>.GetDisplayValue(SupplierEnum.Supplier));
            int count = query.Count();
            var data = query.Skip(intBegin).Take(jTablePara.Length).ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Group", "GroupNote", "CreatedTime");
            return Json(jdata);
        }

        [HttpPost]
        public object JTableWarehouse([FromBody]JTableModelSetting jTablePara)
        {
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = GetGroup(EnumHelper<WarehouseEnum>.GetDisplayValue(WarehouseEnum.Warehouse));
            int count = query.Count();
            var data = query.Skip(intBegin).Take(jTablePara.Length).ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Group", "GroupNote", "CreatedTime");
            return Json(jdata);
        }
        [HttpPost]
        public object JTableFund([FromBody]JTableModelSetting jTablePara)
        {
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = GetGroup(EnumHelper<FundEnum>.GetDisplayValue(FundEnum.Fund));
            int count = query.Count();
            var data = query.Skip(intBegin).Take(jTablePara.Length).ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Group", "GroupNote", "CreatedTime");
            return Json(jdata);
        }

        [HttpGet]
        public object GetCatFund()
        {
            var data = _context.CommonSettings.Where(x => x.Group == "CAT_FUND" && x.IsDeleted == false).AsNoTracking().ToList();
            //var data = _context.FundCatReptExpss.Select(x => new { CatCode = x.CatCode}).AsNoTracking().ToList();
            return data;
        }

        //[HttpPost]
        //public object JTableFile([FromBody]JTableModelSetting jTablePara)
        //{
        //    int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
        //    var query = GetGroup(EnumHelper<File>.GetDisplayValue(SupplierEnum.Supplier));
        //    int count = query.Count();
        //    var data = query.Skip(intBegin).Take(jTablePara.Length).ToList();
        //    var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Group", "GroupNote", "CreatedTime");
        //    return Json(jdata);
        //}

        [HttpPost]
        public object JTableService([FromBody]JTableModelSetting jTablePara)
        {
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = GetGroup(EnumHelper<ServiceEnum>.GetDisplayValue(ServiceEnum.Service));
            int count = query.Count();
            var data = query.Skip(intBegin).Take(jTablePara.Length).ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Group", "GroupNote", "CreatedTime");
            return Json(jdata);
        }

        [HttpPost]
        public object JTableAsset([FromBody]JTableModelSetting jTablePara)
        {
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = GetGroup(EnumHelper<AssetEnum>.GetDisplayValue(AssetEnum.Asset));
            int count = query.Count();
            var data = query.Skip(intBegin).Take(jTablePara.Length).ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Group", "GroupNote", "CreatedTime");
            return Json(jdata);
        }

        [HttpPost]
        public object JTablePayment([FromBody]JTableModelSetting jTablePara)
        {
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = GetGroup(EnumHelper<PaymentEnum>.GetDisplayValue(PaymentEnum.Payment));
            int count = query.Count();
            var data = query.Skip(intBegin).Take(jTablePara.Length).ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Group", "GroupNote", "CreatedTime");
            return Json(jdata);
        }

        [HttpPost]
        public object JTablePublish([FromBody]JTableModelSetting jTablePara)
        {
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = GetGroup(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Publish));
            int count = query.Count();
            var data = query.Skip(intBegin).Take(jTablePara.Length).ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Group", "GroupNote", "CreatedTime");
            return Json(jdata);
        }

        [HttpPost]
        public object JTableCustomer([FromBody]JTableModelSetting jTablePara)
        {
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = GetGroup(EnumHelper<CustomerEnum>.GetDisplayValue(CustomerEnum.Customer));
            int count = query.Count();
            var data = query.Skip(intBegin).Take(jTablePara.Length).ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Group", "GroupNote", "CreatedTime");
            return Json(jdata);
        }

        [HttpPost]
        public object JTableCardjob([FromBody]JTableModelSetting jTablePara)
        {
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = GetGroup(EnumHelper<CardEnum>.GetDisplayValue(CardEnum.CardJob));
            int count = query.Count();
            var data = query.Skip(intBegin).Take(jTablePara.Length).ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Group", "GroupNote", "CreatedTime");
            return Json(jdata);
        }

        [HttpPost]
        public object JTableDetail([FromBody]JTableModelSetting jTablePara)
        {
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var listDataType = GetDataType();
            var query = from a in _context.CommonSettings
                        join b in listDataType on a.Type equals b.Code into b1
                        from b2 in b1.DefaultIfEmpty()
                        where (a.Group == jTablePara.SettingGroup)
                        select new
                        {
                            a.SettingID,
                            a.CodeSet,
                            a.ValueSet,
                            a.Type,
                            TypeName = b2.Name,
                            a.CreatedBy,
                            a.CreatedTime
                        };
            int count = query.Count();
            var data = query.Skip(intBegin).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "SettingID", "CodeSet", "ValueSet", "Type", "TypeName", "CreatedBy", "CreatedTime");
            return Json(jdata);
        }

        [NonAction]
        public IEnumerable<CommonSettingGroupModel> GetGroup(string asset)
        {
            var data = new List<CommonSettingGroupModel>();
            #region Employee

            var employeeStyle = new CommonSettingGroupModel
            {
                AssetCode = EnumHelper<EmployeeEnum>.GetDisplayValue(EmployeeEnum.Employee),
                Group = EnumHelper<EmployeeEnum>.GetDisplayValue(EmployeeEnum.EmployeeStyle),
                GroupNote = "Kiểu nhân viên",
                CreatedTime = DateTime.Now,
            };
            data.Add(employeeStyle);
            #endregion


            #region Contract
            var contractType = new CommonSettingGroupModel
            {
                AssetCode = EnumHelper<ContractEnum>.GetDisplayValue(ContractEnum.Contract),
                Group = EnumHelper<ContractEnum>.GetDisplayValue(ContractEnum.ContractType),
                GroupNote = String.Format(_stringLocalizer["COM_SET_CURD_CONTRACT_TYPE"]),
                CreatedTime = DateTime.Now,
            };
            data.Add(contractType);
            var contractStatus = new CommonSettingGroupModel
            {
                AssetCode = EnumHelper<ContractEnum>.GetDisplayValue(ContractEnum.Contract),
                Group = EnumHelper<ContractEnum>.GetDisplayValue(ContractEnum.ContractStatus),
                GroupNote = String.Format(_stringLocalizer["Trạng thái hợp đồng"]),
                CreatedTime = DateTime.Now,
            };
            data.Add(contractStatus);
            var contractStatusPoCus = new CommonSettingGroupModel
            {
                AssetCode = EnumHelper<ContractEnum>.GetDisplayValue(ContractEnum.Contract),
                Group = EnumHelper<ContractEnum>.GetDisplayValue(ContractEnum.ContractStatusPoCus),
                GroupNote = String.Format(_stringLocalizer["Trạng thái hợp đồng/Đơn hàng"]),
                CreatedTime = DateTime.Now,
            };
            data.Add(contractStatusPoCus);
            var contractStatusPoSup = new CommonSettingGroupModel
            {
                AssetCode = EnumHelper<ContractEnum>.GetDisplayValue(ContractEnum.Contract),
                Group = EnumHelper<ContractEnum>.GetDisplayValue(ContractEnum.ContractStatusPoSup),
                GroupNote = String.Format(_stringLocalizer["Trạng thái đặt hàng(Nhà cung cấp)"]),
                CreatedTime = DateTime.Now,
            };
            data.Add(contractStatusPoSup);

            data.Add(contractStatusPoCus);
            var contractRelative = new CommonSettingGroupModel
            {
                AssetCode = EnumHelper<ContractEnum>.GetDisplayValue(ContractEnum.Contract),
                Group = EnumHelper<ContractEnum>.GetDisplayValue(ContractEnum.ContractRelative),
                GroupNote = String.Format(_stringLocalizer["Mối quan hệ(Hợp đồng liên quan)"]),
                CreatedTime = DateTime.Now,
            };
            data.Add(contractRelative);
            //var contractGroup = new CommonSettingGroupModel
            //{
            //    AssetCode = EnumHelper<ContractEnum>.GetDisplayValue(ContractEnum.Contract),
            //    Group = EnumHelper<ContractEnum>.GetDisplayValue(ContractEnum.ContractExtend),
            //    GroupNote = String.Format(_stringLocalizer["Nhóm mở rộng")),
            //    CreatedTime = DateTime.Now,
            //};
            //data.Add(contractGroup);
            #endregion

            #region Supplier
            var supplierGroup = new CommonSettingGroupModel
            {
                AssetCode = EnumHelper<SupplierEnum>.GetDisplayValue(SupplierEnum.Supplier),
                Group = EnumHelper<SupplierEnum>.GetDisplayValue(SupplierEnum.SupplierGroup),
                GroupNote = String.Format(_stringLocalizer["COM_SET_CURD_SUPPLIER_GROUP"]),
                CreatedTime = DateTime.Now,
            };
            data.Add(supplierGroup);
            var supplierStatus = new CommonSettingGroupModel
            {
                AssetCode = EnumHelper<SupplierEnum>.GetDisplayValue(SupplierEnum.Supplier),
                Group = EnumHelper<SupplierEnum>.GetDisplayValue(SupplierEnum.SupplierStatus),
                GroupNote = String.Format(_stringLocalizer["COM_SET_CURD_SUPPLIER_STATUS"]),
                CreatedTime = DateTime.Now,
            };
            data.Add(supplierStatus);

            var supplierArea = new CommonSettingGroupModel
            {
                AssetCode = EnumHelper<SupplierEnum>.GetDisplayValue(SupplierEnum.Supplier),
                Group = EnumHelper<CommonEnum>.GetDisplayValue(CommonEnum.Area),
                GroupNote = "Khu vực nhà cung cấp",
                CreatedTime = DateTime.Now,
            };
            data.Add(supplierArea);

            var supplierRole = new CommonSettingGroupModel
            {
                AssetCode = EnumHelper<SupplierEnum>.GetDisplayValue(SupplierEnum.Supplier),
                Group = EnumHelper<SupplierEnum>.GetDisplayValue(SupplierEnum.SupplierRole),
                GroupNote = "Vai trò nhà cung cấp",
                CreatedTime = DateTime.Now,
            };
            data.Add(supplierRole);

            var supplierType = new CommonSettingGroupModel
            {
                AssetCode = EnumHelper<SupplierEnum>.GetDisplayValue(SupplierEnum.Supplier),
                Group = EnumHelper<SupplierEnum>.GetDisplayValue(SupplierEnum.SupplierType),
                GroupNote = "Loại nhà cung cấp",
                CreatedTime = DateTime.Now,
            };
            data.Add(supplierType);
            #endregion

            #region Customer 
            var customerGroup = new CommonSettingGroupModel
            {
                AssetCode = EnumHelper<CustomerEnum>.GetDisplayValue(CustomerEnum.Customer),
                Group = EnumHelper<CustomerEnum>.GetDisplayValue(CustomerEnum.CustomerGroup),
                CreatedTime = DateTime.Now,
                GroupNote = String.Format(_stringLocalizer["COM_SET_CURD_CUSTOMER_GROUP"]),
            };
            data.Add(customerGroup);

            var customerArea = new CommonSettingGroupModel
            {
                AssetCode = EnumHelper<CustomerEnum>.GetDisplayValue(CustomerEnum.Customer),
                Group = EnumHelper<CommonEnum>.GetDisplayValue(CommonEnum.Area),
                GroupNote = "Khu vực khách hàng",
                CreatedTime = DateTime.Now,
            };
            data.Add(customerArea);

            var customerStatus = new CommonSettingGroupModel
            {
                AssetCode = EnumHelper<CustomerEnum>.GetDisplayValue(CustomerEnum.Customer),
                Group = EnumHelper<CustomerEnum>.GetDisplayValue(CustomerEnum.CustomerStatus),
                GroupNote = "Trạng thái hợp tác",
                CreatedTime = DateTime.Now,
            };
            data.Add(customerStatus);

            var customerType = new CommonSettingGroupModel
            {
                AssetCode = EnumHelper<CustomerEnum>.GetDisplayValue(CustomerEnum.Customer),
                Group = EnumHelper<CustomerEnum>.GetDisplayValue(CustomerEnum.CustomerType),
                GroupNote = "Loại khách hàng",
                CreatedTime = DateTime.Now,
            };
            data.Add(customerType);
            #endregion

            #region Service
            var serviceMain = new CommonSettingGroupModel
            {
                AssetCode = EnumHelper<ServiceEnum>.GetDisplayValue(ServiceEnum.Service),
                Group = EnumHelper<ServiceEnum>.GetDisplayValue(ServiceEnum.MainService),
                CreatedTime = DateTime.Now,
                GroupNote = String.Format(_stringLocalizer["COM_SET_CURD_MAIN_SERVICE"]),
            };
            data.Add(serviceMain);

            var serviceGroup = new CommonSettingGroupModel
            {
                AssetCode = EnumHelper<ServiceEnum>.GetDisplayValue(ServiceEnum.Service),
                Group = EnumHelper<ServiceEnum>.GetDisplayValue(ServiceEnum.ServiceGroup),
                CreatedTime = DateTime.Now,
                GroupNote = String.Format(_stringLocalizer["COM_SET_CURD_SERVICE_GROUP"]),
            };
            data.Add(serviceGroup);

            var serviceUnit = new CommonSettingGroupModel
            {
                AssetCode = EnumHelper<ServiceEnum>.GetDisplayValue(ServiceEnum.Service),
                Group = EnumHelper<ServiceEnum>.GetDisplayValue(ServiceEnum.ServiceUnit),
                CreatedTime = DateTime.Now,
                GroupNote = String.Format(_stringLocalizer["COM_SET_CURD_SERVICE_UNIT"]),
            };
            data.Add(serviceUnit);

            var serviceUnitValue = new CommonSettingGroupModel
            {
                AssetCode = EnumHelper<ServiceEnum>.GetDisplayValue(ServiceEnum.Service),
                Group = EnumHelper<ServiceEnum>.GetDisplayValue(ServiceEnum.ServiceUnitValue),
                CreatedTime = DateTime.Now,
                GroupNote = String.Format(_stringLocalizer["COM_SET_CURD_SERVICE_UNIT_VALUE"]),
            };
            data.Add(serviceUnitValue);

            var serviceCondition = new CommonSettingGroupModel
            {
                AssetCode = EnumHelper<ServiceEnum>.GetDisplayValue(ServiceEnum.Service),
                Group = EnumHelper<ServiceEnum>.GetDisplayValue(ServiceEnum.ServiceCondition),
                CreatedTime = DateTime.Now,
                GroupNote = String.Format(_stringLocalizer["COM_SET_CURD_SERVICE_CONDITION"]),
            };
            data.Add(serviceCondition);

            var serviceStatus = new CommonSettingGroupModel
            {
                AssetCode = EnumHelper<ServiceEnum>.GetDisplayValue(ServiceEnum.Service),
                Group = EnumHelper<ServiceEnum>.GetDisplayValue(ServiceEnum.ServiceStatus),
                CreatedTime = DateTime.Now,
                GroupNote = String.Format(_stringLocalizer["COM_SET_CURD_SERVICE_STATUS"]),
            };
            data.Add(serviceStatus);

            #endregion

            #region Asset
            var assetType = new CommonSettingGroupModel
            {
                AssetCode = EnumHelper<AssetEnum>.GetDisplayValue(AssetEnum.Asset),
                Group = EnumHelper<AssetEnum>.GetDisplayValue(AssetEnum.AssetType),
                CreatedTime = DateTime.Now,
                GroupNote = String.Format(_stringLocalizer["COM_SET_CURD_ASSET_TYPE"]),
            };
            data.Add(assetType);

            var assetGroup = new CommonSettingGroupModel
            {
                AssetCode = EnumHelper<AssetEnum>.GetDisplayValue(AssetEnum.Asset),
                Group = EnumHelper<AssetEnum>.GetDisplayValue(AssetEnum.AssetGroup),
                CreatedTime = DateTime.Now,
                GroupNote = String.Format(_stringLocalizer["COM_SET_CURD_ASSET_GROUP"]),
            };
            data.Add(assetGroup);

            var assetActivityType = new CommonSettingGroupModel
            {
                AssetCode = EnumHelper<AssetEnum>.GetDisplayValue(AssetEnum.Asset),
                Group = EnumHelper<AssetEnum>.GetDisplayValue(AssetEnum.AssetActivityType),
                CreatedTime = DateTime.Now,
                GroupNote = String.Format(_stringLocalizer["COM_SET_CURD_ASSET_ACTIVITY_TYPE"]),
            };
            data.Add(assetActivityType);

            #endregion

            #region Payment
            var paymentObj = new CommonSettingGroupModel
            {
                AssetCode = EnumHelper<PaymentEnum>.GetDisplayValue(PaymentEnum.Payment),
                Group = EnumHelper<PaymentEnum>.GetDisplayValue(PaymentEnum.PayObjTyoe),
                CreatedTime = DateTime.Now,
                GroupNote = String.Format(_stringLocalizer["COM_SET_CURD_PAY_OBJ_TYOE"]),
            };
            data.Add(paymentObj);

            var paymentType = new CommonSettingGroupModel
            {
                AssetCode = EnumHelper<PaymentEnum>.GetDisplayValue(PaymentEnum.Payment),
                Group = EnumHelper<PaymentEnum>.GetDisplayValue(PaymentEnum.PayType),
                CreatedTime = DateTime.Now,
                GroupNote = String.Format(_stringLocalizer["COM_SET_CURD_PAY_TYPE"]),
            };
            data.Add(paymentType);

            #endregion

            #region Publish
            var status = new CommonSettingGroupModel
            {
                AssetCode = EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Publish),
                Group = EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Status),
                CreatedTime = DateTime.Now,
                GroupNote = String.Format(_stringLocalizer["Trạng thái"]),
            };
            data.Add(status);

            var origin = new CommonSettingGroupModel
            {
                AssetCode = EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Publish),
                Group = EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Origin),
                CreatedTime = DateTime.Now,
                GroupNote = String.Format(_stringLocalizer["COM_SET_CURD_PUBLISH_ORIGIN"]),
            };
            data.Add(origin);
            var curency = new CommonSettingGroupModel
            {
                AssetCode = EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Publish),
                Group = EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.CurrencyType),
                CreatedTime = DateTime.Now,
                GroupNote = String.Format(_stringLocalizer["COM_SET_CURD_PUBLISH_CURRENCY_TYPE"]),
            };
            data.Add(curency);
            var unit = new CommonSettingGroupModel
            {
                AssetCode = EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Publish),
                Group = EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit),
                CreatedTime = DateTime.Now,
                GroupNote = String.Format(_stringLocalizer["COM_SET_CURD_PUBLISH_UNIT"]),
            };
            data.Add(unit);

            var productGroup = new CommonSettingGroupModel
            {
                AssetCode = EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Publish),
                Group = EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.ProductGroup),
                CreatedTime = DateTime.Now,
                GroupNote = String.Format(_stringLocalizer["COM_SET_CURD_PRODUCT_GROUP"]),
            };
            data.Add(productGroup);

            var task = new CommonSettingGroupModel
            {
                AssetCode = EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Publish),
                Group = EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Task),
                CreatedTime = DateTime.Now,
                GroupNote = String.Format(_stringLocalizer["COM_SET_CURD_PUBLISH_TASK"]),
            };
            data.Add(task);

            var programLanguage = new CommonSettingGroupModel
            {
                AssetCode = EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Publish),
                Group = EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.ProgramLanguage),
                CreatedTime = DateTime.Now,
                GroupNote = String.Format(_stringLocalizer["COM_SET_CURD_PROGRAM_LANGUAGE"]),
            };
            data.Add(programLanguage);

            var table = new CommonSettingGroupModel
            {
                AssetCode = EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Publish),
                Group = EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Table),
                CreatedTime = DateTime.Now,
                GroupNote = String.Format(_stringLocalizer["Số dòng hiển thị trong 1 bảng"]),
            };
            data.Add(table);
            #endregion

            #region Project
            var ProjectCurency = new CommonSettingGroupModel
            {
                AssetCode = EnumHelper<ProjectEnum>.GetDisplayValue(ProjectEnum.Project),
                Group = EnumHelper<ProjectEnum>.GetDisplayValue(ProjectEnum.ProCurrency),
                CreatedTime = DateTime.Now,
                GroupNote = String.Format(_stringLocalizer["Đơn vị"]),
            };
            data.Add(ProjectCurency);


            var ProjectStatus = new CommonSettingGroupModel
            {
                AssetCode = EnumHelper<ProjectEnum>.GetDisplayValue(ProjectEnum.Project),
                Group = EnumHelper<ProjectEnum>.GetDisplayValue(ProjectEnum.ProStatus),
                CreatedTime = DateTime.Now,
                GroupNote = String.Format(_stringLocalizer["COM_SET_CURD_PRO_STATUS"]),
            };
            data.Add(ProjectStatus);

            var ProjectType = new CommonSettingGroupModel
            {
                AssetCode = EnumHelper<ProjectEnum>.GetDisplayValue(ProjectEnum.Project),
                Group = EnumHelper<ProjectEnum>.GetDisplayValue(ProjectEnum.ProType),
                CreatedTime = DateTime.Now,
                GroupNote = "Loại dự án",
            };
            data.Add(ProjectType);

            var ProjectSetPriority = new CommonSettingGroupModel
            {
                AssetCode = EnumHelper<ProjectEnum>.GetDisplayValue(ProjectEnum.Project),
                Group = EnumHelper<ProjectEnum>.GetDisplayValue(ProjectEnum.ProSetPriority),
                CreatedTime = DateTime.Now,
                GroupNote = "Thiết lập ưu tiên",
            };
            data.Add(ProjectSetPriority);
            #endregion

            #region CardJob
            var CardJobDependency = new CommonSettingGroupModel
            {
                AssetCode = EnumHelper<CardEnum>.GetDisplayValue(CardEnum.CardJob),
                Group = EnumHelper<CardEnum>.GetDisplayValue(CardEnum.ObjDependency),
                CreatedTime = DateTime.Now,
                GroupNote = String.Format(_stringLocalizer["COM_SET_CURD_OBJ_DEPENDENCY"]),
            };
            data.Add(CardJobDependency);
            var CardJobWorkType = new CommonSettingGroupModel
            {
                AssetCode = EnumHelper<CardEnum>.GetDisplayValue(CardEnum.CardJob),
                Group = EnumHelper<CardEnum>.GetDisplayValue(CardEnum.ObjWorkType),
                CreatedTime = DateTime.Now,
                GroupNote = String.Format(_stringLocalizer["COM_SET_CURD_OBJ_WORKTYPE"]),
            };
            data.Add(CardJobWorkType);
            //var CardJobRelative = new CommonSettingGroupModel
            //{
            //    AssetCode = EnumHelper<CardEnum>.GetDisplayValue(CardEnum.CardJob),
            //    Group = EnumHelper<CardEnum>.GetDisplayValue(CardEnum.ObjRelative),
            //    CreatedTime = DateTime.Now,
            //    GroupNote = String.Format(_stringLocalizer["COM_SET_CURD_OBJ_RELATIVE")),
            //};
            //data.Add(CardJobRelative);
            var CardJobStatus = new CommonSettingGroupModel
            {
                AssetCode = EnumHelper<CardEnum>.GetDisplayValue(CardEnum.CardJob),
                Group = EnumHelper<CardEnum>.GetDisplayValue(CardEnum.Stautus),
                CreatedTime = DateTime.Now,
                GroupNote = String.Format(_stringLocalizer["COM_SET_CURD_PRO_STATUS"]),
            };
            data.Add(CardJobStatus);
            var CardJobLevel = new CommonSettingGroupModel
            {
                AssetCode = EnumHelper<CardEnum>.GetDisplayValue(CardEnum.CardJob),
                Group = EnumHelper<CardEnum>.GetDisplayValue(CardEnum.Level),
                CreatedTime = DateTime.Now,
                GroupNote = String.Format(_stringLocalizer["COM_SET_CURD_OBJ_LEVEL"]),
            };
            data.Add(CardJobLevel);
            #endregion

            #region Warehouse
            var ImpStatus = new CommonSettingGroupModel
            {
                AssetCode = EnumHelper<WarehouseEnum>.GetDisplayValue(WarehouseEnum.Warehouse),
                Group = EnumHelper<WarehouseEnum>.GetDisplayValue(WarehouseEnum.ImpStatus),
                CreatedTime = DateTime.Now,
                GroupNote = String.Format(_stringLocalizer["Trạng thái Y/C nhập khẩu"]),
            };
            data.Add(ImpStatus);

            var UnitProduct = new CommonSettingGroupModel
            {
                AssetCode = EnumHelper<WarehouseEnum>.GetDisplayValue(WarehouseEnum.Warehouse),
                Group = EnumHelper<WarehouseEnum>.GetDisplayValue(WarehouseEnum.UnitProduct),
                CreatedTime = DateTime.Now,
                GroupNote = String.Format(_stringLocalizer["Đơn vị sản phẩm"]),
            };
            data.Add(UnitProduct);
            var CatStatus = new CommonSettingGroupModel
            {
                AssetCode = EnumHelper<WarehouseEnum>.GetDisplayValue(WarehouseEnum.Warehouse),
                Group = EnumHelper<WarehouseEnum>.GetDisplayValue(WarehouseEnum.CatStatus),
                CreatedTime = DateTime.Now,
                GroupNote = String.Format(_stringLocalizer["Trạng thái danh mục sản phẩm"]),
            };
            data.Add(CatStatus);
            #endregion

            #region Fund
            var FundRelative = new CommonSettingGroupModel
            {
                AssetCode = EnumHelper<FundEnum>.GetDisplayValue(FundEnum.Fund),
                Group = EnumHelper<FundEnum>.GetDisplayValue(FundEnum.FundRelative),
                CreatedTime = DateTime.Now,
                GroupNote = String.Format(_stringLocalizer["Quan hệ"]),
            };
            data.Add(FundRelative);
            #endregion

            #region CMS
            var CMSTemplate = new CommonSettingGroupModel
            {
                AssetCode = EnumHelper<CMSEnum>.GetDisplayValue(CMSEnum.CMS),
                Group = EnumHelper<CMSEnum>.GetDisplayValue(CMSEnum.CMSTemplate),
                CreatedTime = DateTime.Now,
                GroupNote = String.Format(_stringLocalizer["Template"]),
            };
            data.Add(CMSTemplate);
            var CMSBlock = new CommonSettingGroupModel
            {
                AssetCode = EnumHelper<CMSEnum>.GetDisplayValue(CMSEnum.CMS),
                Group = EnumHelper<CMSEnum>.GetDisplayValue(CMSEnum.CMSBlock),
                CreatedTime = DateTime.Now,
                GroupNote = String.Format(_stringLocalizer["Danh sách Block hiển thị"]),
            };
            data.Add(CMSBlock);
            #endregion

            var list = data.Where(x => x.AssetCode == asset);
            return list;
        }

        [HttpGet]
        public List<DataType> GetDataType()
        {
            var data = new List<DataType>();

            var dataTypeText = new DataType
            {
                Code = EnumHelper<DataTypeEnum>.GetDisplayValue(DataTypeEnum.Text),
                Name = DataTypeEnum.Text.DescriptionAttr(),
            };
            data.Add(dataTypeText);

            var dataTypeNumber = new DataType
            {
                Code = EnumHelper<DataTypeEnum>.GetDisplayValue(DataTypeEnum.Number),
                Name = DataTypeEnum.Number.DescriptionAttr(),
            };
            data.Add(dataTypeNumber);

            var dataTypeMoney = new DataType
            {
                Code = EnumHelper<DataTypeEnum>.GetDisplayValue(DataTypeEnum.Money),
                Name = DataTypeEnum.Money.DescriptionAttr(),
            };
            data.Add(dataTypeMoney);

            var dataTypeDateTime = new DataType
            {
                Code = EnumHelper<DataTypeEnum>.GetDisplayValue(DataTypeEnum.DateTime),
                Name = DataTypeEnum.DateTime.DescriptionAttr(),
            };
            data.Add(dataTypeDateTime);

            return data;
        }

        [HttpPost]
        public object JTableNotificationCard([FromBody]JTableModelSetting jTablePara)
        {
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = _context.CommonSettings.Where(x => x.AssetCode == EnumHelper<CardEnum>.GetDisplayValue(CardEnum.CardJob)
            && x.Group == EnumHelper<CardEnum>.GetDisplayValue(CardEnum.Notification) && !x.IsDeleted);
            int count = query.Count();
            var data = query.Skip(intBegin).Take(jTablePara.Length).ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Group", "GroupNote", "CreatedTime");
            return Json(jdata);
        }
        #region insert,edit,delete
        [HttpPost]
        public object GetItem(int id)
        {
            var data = _context.CommonSettings.FirstOrDefault(x => x.SettingID == id);
            return Json(data);
        }

        [HttpPost]
        public object Insert([FromBody]CommonSetting data)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                data.CodeSet = data.Group + DateTime.Now.ToString("yyyyMMddHHmmss");
                data.CreatedBy = ESEIM.AppContext.UserName;
                data.CreatedTime = DateTime.Now;
                _context.CommonSettings.Add(data);
                _context.SaveChanges();
                msg.Title = String.Format(_sharedResources["COM_ADD_SUCCESS"]);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_ERR_ADD"]);
            }
            return Json(msg);
        }

        [HttpPost]
        public object Update([FromBody]CommonSetting data)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var item = _context.CommonSettings.FirstOrDefault(x => x.CodeSet == data.CodeSet);
                if(item.CodeSet == "NOTIFICATION_CARD")
                {
                    if(data.ValueSet.ToLower() != "NO".ToLower() 
                        && data.ValueSet.ToLower() != "YES".ToLower())
                    {
                        msg.Title = "Nhập giá trị cài đặt là YES/NO";
                        msg.Error = true;
                        return Json(msg);
                    }
                    else
                    {
                        item.UpdatedBy = ESEIM.AppContext.UserName;
                        item.UpdatedTime = DateTime.Now;
                        item.ValueSet = data.ValueSet;
                        item.Type = data.Type;
                        _context.SaveChanges();
                        msg.Title = String.Format(_sharedResources["COM_UPDATE_SUCCESS"]);
                        return Json(msg);
                    }
                }
                else
                {
                    item.UpdatedBy = ESEIM.AppContext.UserName;
                    item.UpdatedTime = DateTime.Now;
                    item.ValueSet = data.ValueSet;
                    item.Type = data.Type;
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_UPDATE_SUCCESS"]);
                    return Json(msg);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_UPDATE_FAIL"]);
                msg.Object = ex;
                return Json(msg);
            }
        }

        [HttpPost]
        public JsonResult Delete([FromBody]int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.CommonSettings.FirstOrDefault(x => x.SettingID == id);
                if(data.CodeSet == EnumHelper<CardEnum>.GetDisplayValue(CardEnum.NotificationCard))
                {
                    msg.Error = true;
                    msg.Title = "Không được phép xóa thuộc tính này";
                }
                else
                {
                    var customer = _context.Customerss.FirstOrDefault(x => x.ActivityStatus.Equals(data.CodeSet) || x.CusType.Equals(data.CodeSet) || x.CusGroup.Equals(data.CodeSet) || x.Area.Equals(data.CodeSet));
                    if (customer == null)
                    {
                        if (data.CodeSet != "NUM_PER_PAGE")
                        {
                            _context.CommonSettings.Remove(data);
                            _context.SaveChanges();
                            msg.Title = String.Format(_sharedResources["COM_DELETE_SUCCESS"]);
                        }
                        else
                        {
                            msg.Error = true;
                            msg.Title = "Thuộc tính đã được sử dụng. Không được xóa thuộc tính này!";
                        }
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = "Thuộc tính đã được sử dụng, không được xóa";
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_ERR_DELETE"]);
            }
            return Json(msg);
        }
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
    }
}