using System;
using Microsoft.EntityFrameworkCore;
using III.Domain.Common;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace ESEIM.Models
{
    public partial class EIMDBContext : IdentityDbContext<AspNetUser, AspNetRole, string>
    {
        public EIMDBContext(DbContextOptions<EIMDBContext> options) : base(options)
        {
        }
        /// <summary>
        /// Amin System management
        /// </summary>
        public virtual DbSet<AdDivision> AdDivisions { get; set; }
        public virtual DbSet<AdAccessLog> AdAccessLogs { get; set; }
        public virtual DbSet<AdActionLog> AdActionLogs { get; set; }
        public virtual DbSet<AdAppFunction> AdAppFunctions { get; set; }
        public virtual DbSet<AdApplication> AdApplications { get; set; }
        public virtual DbSet<AdFunction> AdFunctions { get; set; }
        public virtual DbSet<AdGroupUser> AdGroupUsers { get; set; }
        public virtual DbSet<AdDepartment> AdDepartments { get; set; }
        public virtual DbSet<AdLanguage> AdLanguages { get; set; }
        public virtual DbSet<AdLanguageText> AdLanguageTexts { get; set; }
        public virtual DbSet<AdOrganization> AdOrganizations { get; set; }
        public virtual DbSet<AdParameter> AdParameters { get; set; }
        public virtual DbSet<AdPermission> AdPermissions { get; set; }
        public virtual DbSet<AdPrivilege> AdPrivileges { get; set; }
        public virtual DbSet<AdResource> AdResources { get; set; }
        public virtual DbSet<AdUserInGroup> AdUserInGroups { get; set; }
        public virtual DbSet<AdUserDepartment> AdUserDepartments { get; set; }
        public virtual DbSet<AdAuthoring> AdAuthorings { get; set; }
        public virtual DbSet<FcmToken> FcmTokens { get; set; }
        /// <summary>
        /// Customer
        /// </summary>
        public virtual DbSet<Customers> Customerss { get; set; }
        public virtual DbSet<CustomerFile> CustomerFiles { get; set; }
        public virtual DbSet<CustomerExtend> CustomerExtends { get; set; }
        public virtual DbSet<CustomerReminder> CustomerReminders { get; set; }
        public virtual DbSet<OrderRequestRaw> OrderRequestRaws { get; set; }
        public virtual DbSet<OrderRequestRawFiles> OrderRequestRawFiless { get; set; }

        /// <summary>
        /// Supplier
        /// </summary>
        public virtual DbSet<Supplier> Suppliers { get; set; }
        public virtual DbSet<SupplierExtend> SupplierExtends { get; set; }
        public virtual DbSet<SupplierFile> SupplierFiles { get; set; }

        /// <summary>
        ///EDMS
        /// </summary>
        public virtual DbSet<EDMSCategory> EDMSCategorys { get; set; }
        public virtual DbSet<EDMSRepository> EDMSRepositorys { get; set; }
        public virtual DbSet<EDMSCatRepoSetting> EDMSCatRepoSettings { get; set; }
        public virtual DbSet<EDMSRepoCatFile> EDMSRepoCatFiles { get; set; }
        public virtual DbSet<EDMSFile> EDMSFiles { get; set; }
        public virtual DbSet<EDMSFilePermission> EDMSFilePermissions { get; set; }
        public virtual DbSet<EDMSWareHouse> EDMSWareHouses { get; set; }
        public virtual DbSet<EDMSWareHouseUsers> EDMSWareHouseUsers { get; set; }
        public virtual DbSet<EDMSWhsMedia> EDMSWhsMedias { get; set; }
        public virtual DbSet<EDMSWareHouseMedia> EDMSWareHouseMedias { get; set; }
        public virtual DbSet<EDMSFloor> EDMSFloors { get; set; }
        public virtual DbSet<EDMSLine> EDMSLines { get; set; }
        public virtual DbSet<EDMSRack> EDMSRacks { get; set; }
        public virtual DbSet<EDMSBox> EDMSBoxs { get; set; }
        public virtual DbSet<EDMSBoxFile> EDMSBoxFiles { get; set; }
        public virtual DbSet<EDMSBoxTracking> EDMSBoxTrackings { get; set; }
        public virtual DbSet<EDMSEntityMapping> EDMSEntityMappings { get; set; }
        public virtual DbSet<EDMSMoveBoxLog> EDMSMoveBoxLogs { get; set; }
        public virtual DbSet<EDMSWhsQrCode> EDMSWhsQrCodes { get; set; }
        public virtual DbSet<EDMSRequestInputStore> EDMSRequestInputStores { get; set; }
        public virtual DbSet<EDMSRequestEndBox> EDMSRequestEndBoxs { get; set; }
        public virtual DbSet<EDMSReqInputFile> EDMSReqFiles { get; set; }
        public virtual DbSet<EDMSReqExportFile> EDMSReqExportFiles { get; set; }
        public virtual DbSet<EDMSReceiptInputStore> EDMSReceiptInputStores { get; set; }
        public virtual DbSet<EDMSReceiptExportStore> EDMSReceiptExportStores { get; set; }
        public virtual DbSet<EDMSRecInputFile> EDMSRecFiles { get; set; }
        public virtual DbSet<EDMSRecExportFile> EDMSRecExportFiles { get; set; }
        public virtual DbSet<EDMSTermite> EDMSTermites { get; set; }
        public virtual DbSet<EDMSTermiteBox> EDMSTermiteBoxs { get; set; }
        public virtual DbSet<EDMSRemove> EDMSRemoves { get; set; }
        public virtual DbSet<EDMSRemoveBox> EDMSRemoveBoxs { get; set; }
        public virtual DbSet<EDMSTimeOfDocumentPreservation> EDMSTimeOfDocumentPreservations { get; set; }
        public virtual DbSet<EDMSRequestTracking> EDMSRequestTrackings { get; set; }
        public virtual DbSet<EDMSRequestExportStore> EDMSRequestExportStores { get; set; }
        public virtual DbSet<EDMSWarehouseExtend> EDMSWarehouseExtends { get; set; }
        public virtual DbSet<WORKOSAddressCard> WORKOSAddressCards { get; set; }
        /// <summary>
        /// Service
        /// </summary>
        public virtual DbSet<ServiceCategory> ServiceCategorys { get; set; }
        public virtual DbSet<ContractServiceDetail> ContractServiceDetails { get; set; }
        public virtual DbSet<ContractServiceDetailHis> ContractServiceDetailHiss { get; set; }
        //public virtual DbSet<ProductCat> ProductCats { get; set; }

        /// <summary>
        /// Notification
        /// </summary>
        public virtual DbSet<Notification> Notifications { get; set; }
        public virtual DbSet<NotificationObject> NotificationObjects { get; set; }


        /// <summary>
        /// Tracking
        /// </summary>
        public virtual DbSet<UserTrackingGps> UserTrackingGpss { get; set; }
        /// <summary>
        /// Reminder
        /// </summary>
        public virtual DbSet<ReminderAttr> ReminderAttrs { get; set; }

        /// <summary>
        /// Map
        /// </summary>
        public virtual DbSet<MapDataGps> MapDataGpss { get; set; }

        /// <summary>
        /// Contract
        /// </summary>
        public virtual DbSet<PoSaleHeader> PoSaleHeaders { get; set; }
        public virtual DbSet<PoSaleHeaderHis> PoSaleHeaderHiss { get; set; }
        public virtual DbSet<PoSaleHeaderNotDone> PoSaleHeaderNotDones { get; set; }
        public virtual DbSet<ContractDetail> ContractDetails { get; set; }
        public virtual DbSet<ContractFile> ContractFiles { get; set; }
        public virtual DbSet<ContractPeopleTag> ContractPeopleTags { get; set; }
        public virtual DbSet<ContractAttribute> ContractAttributes { get; set; }
        public virtual DbSet<ContractAttributeHis> ContractAttributeHiss { get; set; }
        public virtual DbSet<ContractActivity> ContractActivitys { get; set; }
        public virtual DbSet<Contact> Contacts { get; set; }
        public virtual DbSet<ContactNote> ContactNotes { get; set; }
        public virtual DbSet<ContractMemberTag> ContractMemberTags { get; set; }
        public virtual DbSet<EntityMapping> EntityMappings { get; set; }
        public virtual DbSet<MappingMain> MappingMains { get; set; }
        public virtual DbSet<PoSupAttribute> PoSupAttributes { get; set; }
        public virtual DbSet<ContractSchedulePay> ContractSchedulePays { get; set; }
        public virtual DbSet<ContractSchedulePayHis> ContractSchedulePayHiss { get; set; }
        public virtual DbSet<VHisImpProduct> VHisImpProducts { get; set; }
        public virtual DbSet<VHisProduct> VHisProducts { get; set; }
        public virtual DbSet<VImpExpProduct> VImpExpProducts { get; set; }
        public virtual DbSet<VReportStaticsPoSup> VReportStaticsPoSups { get; set; }
        public virtual DbSet<VProductAllTable> VProductAllTables { get; set; }

        ///<summary>
        ///Warehouse
        ///</summary>  
        public virtual DbSet<MaterialProduct> MaterialProducts { get; set; }
        public virtual DbSet<MaterialProductGroup> MaterialProductGroups { get; set; }
        public virtual DbSet<MaterialProductAttributeMain> MaterialProductAttributeMains { get; set; }
        public virtual DbSet<AttrGalaxy> AttrGalaxys { get; set; }
        public virtual DbSet<AttrGalaxyAet> AttrGalaxyAets { get; set; }
        public virtual DbSet<AttributeManager> AttributeManagers { get; set; }
        public virtual DbSet<AssetAttrGalaxy> AssetAttrGalaxys { get; set; }
        public virtual DbSet<ProductAttrGalaxy> ProductAttrGalaxys { get; set; }
        public virtual DbSet<AttributeManagerGalaxy> AttributeManagerGalaxys { get; set; }
        public virtual DbSet<ProductComponent> ProductComponents { get; set; }
        public virtual DbSet<MaterialProductAttributeChildren> MaterialProductAttributeChildrens { get; set; }
        public virtual DbSet<MaterialProductAssetChildren> MaterialProductAssetChildrens { get; set; }
        public virtual DbSet<MaterialType> MaterialTypes { get; set; }
        public virtual DbSet<MaterialAttribute> MaterialAttributes { get; set; }
        public virtual DbSet<MaterialFile> MaterialFiles { get; set; }
        public virtual DbSet<ProdDeliveryHeader> ProdDeliveryHeaders { get; set; }
        public virtual DbSet<ProdDeliveryDetail> ProdDeliveryDetails { get; set; }
        public virtual DbSet<MaterialStoreBatchGoods> MaterialStoreBatchGoodss { get; set; }
        public virtual DbSet<ProdReceivedHeader> ProdReceivedHeaders { get; set; }
        public virtual DbSet<ProdReceivedDetail> ProdReceivedDetails { get; set; }
        public virtual DbSet<MaterialInvoice> MaterialInvoices { get; set; }
        public virtual DbSet<CommonSetting> CommonSettings { get; set; }
        //public virtual DbSet<MaterialStore> MaterialStores { get; set; }
        public virtual DbSet<MaterialPaymentTicket> MaterialPaymentTickets { get; set; }
        public virtual DbSet<ProductInStock> ProductInStocks { get; set; }
        public virtual DbSet<ProductInStockExp> ProductInStockExps { get; set; }
        public virtual DbSet<ForecastProductInStock> ForecastProductInStocks { get; set; }
        public virtual DbSet<ProductEntityMapping> ProductEntityMappings { get; set; }
        public virtual DbSet<ProductEntityMappingLog> ProductEntityMappingLogs { get; set; }
        public virtual DbSet<EDMSMoveProductLog> EDMSMoveProductLogs { get; set; }
        public virtual DbSet<ProductAttribute> ProductAttributes { get; set; }
        public virtual DbSet<MaterialStoreImpGoodsHeader> MaterialStoreImpGoodsHeaders { get; set; }
        public virtual DbSet<MaterialStoreImpGoodsDetail> MaterialStoreImpGoodsDetails { get; set; }

        public virtual DbSet<PoSupHeader> PoSupHeaders { get; set; }
        public virtual DbSet<PoSupHeaderNotDone> PoSupHeaderNotDones { get; set; }
        public virtual DbSet<PoSupHeaderPayment> PoSupHeaderPayments { get; set; }
        public virtual DbSet<Vayxe_Customer> Vayxe_Customer { get; set; }
        ////2 Bảng yêu cầu đặt hàng mới - theo form mẫu chị Tuyến gửi 2019.06.01
        //public virtual DbSet<RequestOrderHeader> RequestOrderHeaders { get; set; }
        //public virtual DbSet<RequestOrderDetail> RequestOrderDetails { get; set; }

        //2 Bảng yêu cầu đặt hàng cũ - trước khi chị Tuyến gửi form mẫu 2019.06.01
        public virtual DbSet<RequestImpProductHeader> RequestImpProductHeaders { get; set; }
        public virtual DbSet<RequestImpProductDetail> RequestImpProductDetails { get; set; }
        public virtual DbSet<RequestPriceHeader> RequestPriceHeaders { get; set; }
        public virtual DbSet<RequestPriceDetail> RequestPriceDetails { get; set; }
        public virtual DbSet<PoSupRequestImpProduct> PoSupRequestImpProducts { get; set; }
        public virtual DbSet<RequestPoSup> RequestPoSups { get; set; }
        public virtual DbSet<cms_attachments> cms_attachments { get; set; }
        public virtual DbSet<cms_categories> cms_categories { get; set; }
        public virtual DbSet<cms_comments> cms_comments { get; set; }
        public virtual DbSet<cms_extra_fields> cms_extra_fields { get; set; }
        public virtual DbSet<cms_extra_fields_groups> cms_extra_fields_groups { get; set; }
        public virtual DbSet<cms_extra_fields_value> cms_extra_fields_value { get; set; }
        public virtual DbSet<cms_functions> cms_functions { get; set; }
        public virtual DbSet<cms_function_group> cms_function_group { get; set; }
        public virtual DbSet<cms_function_resource> cms_function_resource { get; set; }
        public virtual DbSet<cms_items> cms_items { get; set; }
        public virtual DbSet<cms_rating> cms_rating { get; set; }
        public virtual DbSet<cms_roles> cms_roles { get; set; }
        public virtual DbSet<cms_setting> cms_setting { get; set; }
        public virtual DbSet<cms_tags> cms_tags { get; set; }
        public virtual DbSet<cms_tags_xref> cms_tags_xref { get; set; }
        public virtual DbSet<CommonSettingArticle> CommonSettingArticles { get; set; }

        /// <summary>
        /// Asset
        /// </summary>
        public virtual DbSet<Asset> Assets { get; set; }
        public virtual DbSet<AssetAttribute> AssetAttributes { get; set; }
        public virtual DbSet<AssetActivity> AssetAtivitys { get; set; }
        public virtual DbSet<AssetMain> AssetMains { get; set; }
        public virtual DbSet<AssetType> AssetTypes { get; set; }
        public virtual DbSet<AssetGroup> AssetGroups { get; set; }
        public virtual DbSet<AssetInventoryHeader> AssetInventoryHeaders { get; set; }
        public virtual DbSet<AssetInventoryDetail> AssetInventoryDetails { get; set; }
        public virtual DbSet<AssetInventoryFile> AssetInventoryFiles { get; set; }
        public virtual DbSet<AssetAllocateHeader> AssetAllocateHeaders { get; set; }
        public virtual DbSet<AssetAllocateDetail> AssetAllocateDetails { get; set; }
        public virtual DbSet<AssetAllocationFile> AssetAllocationFiles { get; set; }
        public virtual DbSet<AssetBuyHeader> AssetBuyHeaders { get; set; }
        public virtual DbSet<AssetBuyDetail> AssetBuyDetails { get; set; }
        public virtual DbSet<AssetBuyFile> AssetBuyFiles { get; set; }
        public virtual DbSet<AssetTransferHeader> AssetTransferHeaders { get; set; }
        public virtual DbSet<AssetTransferDetail> AssetTransferDetails { get; set; }
        public virtual DbSet<AssetTransferFile> AssetTransferFiles { get; set; }
        public virtual DbSet<AssetRqMaintenanceRepairHeader> AssetRqMaintenanceRepairHeaders { get; set; }
        public virtual DbSet<AssetRqMaintenanceRepairDetail> AssetRqMaintenanceRepairDetails { get; set; }
        public virtual DbSet<AssetRqMaintenanceRepairFile> AssetRqMaintenanceRepairFiles { get; set; }
        public virtual DbSet<AssetMaintenanceHeader> AssetMaintenanceHeaders { get; set; }
        public virtual DbSet<AssetMaintenanceDetails> AssetMaintenanceDetailss { get; set; }
        public virtual DbSet<AssetMaintenanceFile> AssetMaintenanceFiles { get; set; }
        public virtual DbSet<AssetMaintenanceCategory> AssetMaintenanceCategorys { get; set; }
        public virtual DbSet<AssetImprovementHeader> AssetImprovementHeaders { get; set; }
        public virtual DbSet<AssetImprovementDetails> AssetImprovementDetailss { get; set; }
        public virtual DbSet<AssetImprovementFile> AssetImprovementFiles { get; set; }
        public virtual DbSet<AssetImprovementCategory> AssetImprovementCategorys { get; set; }
        public virtual DbSet<AssetCancelHeader> AssetCancelHeaders { get; set; }
        public virtual DbSet<AssetCancelDetail> AssetCancelDetails { get; set; }
        public virtual DbSet<AssetCancelFile> AssetCancelFiles { get; set; }
        public virtual DbSet<AssetLiquidationHeader> AssetLiquidationHeaders { get; set; }
        public virtual DbSet<AssetLiquidationDetail> AssetLiquidationDetails { get; set; }
        public virtual DbSet<AssetLiquidationFile> AssetLiquidationFiles { get; set; }
        public virtual DbSet<AssetRPTBrokenHeader> AssetRPTBrokenHeaders { get; set; }
        public virtual DbSet<AssetRPTBrokenDetails> AssetRPTBrokenDetails { get; set; }
        public virtual DbSet<AssetRPTBrokenFile> AssetRPTBrokenFiles { get; set; }
        public virtual DbSet<AssetRecalledHeader> AssetRecalledHeaders { get; set; }
        public virtual DbSet<AssetRecalledDetail> AssetRecalledDetails { get; set; }
        public virtual DbSet<AssetRecalledFile> AssetRecalledFiles { get; set; }


        /// <summary>
        /// Log Activity new
        /// </summary>
        public virtual DbSet<CatWorkFlow> CatWorkFlows { get; set; }
        public virtual DbSet<CatActivity> CatActivitys { get; set; }
        public virtual DbSet<ActivityLogData> ActivityLogDatas { get; set; }
        public virtual DbSet<ActivityAttrData> ActivityAttrDatas { get; set; }
        public virtual DbSet<ActivityAttrSetup> ActivityAttrSetups { get; set; }
        public virtual DbSet<WorkflowActivity> ObjectActivitys { get; set; }
        public virtual DbSet<WorkflowActivityRole> WorkflowActivityRoles { get; set; }



        /// <summary>
        /// HR
        /// </summary>
        public virtual DbSet<HRAddress> HRAddress { get; set; }
        public virtual DbSet<HRContact> HRContacts { get; set; }
        public virtual DbSet<HRContract> HRContracts { get; set; }
        public virtual DbSet<HREmployee> HREmployees { get; set; }
        public virtual DbSet<HRTrainingCourse> HRTrainingCourses { get; set; }
        public virtual DbSet<HRWorkFlows> HRWorkFlows { get; set; }
        public virtual DbSet<HRWorkingProcess> HRWorkingProcesss { get; set; }
        public virtual DbSet<HrTranningCourseFile> HrTranningCourseFiles { get; set; }

        /// <summary>
        /// Project
        /// </summary>
        public virtual DbSet<Project> Projects { get; set; }
        public virtual DbSet<ProjectTeam> ProjectTeams { get; set; }

        public virtual DbSet<ProjectCustomer> ProjectCustomers { get; set; }
        public virtual DbSet<ProjectGantt> ProjectGantts { get; set; }
        public virtual DbSet<ProjectMember> ProjectMembers { get; set; }
        public virtual DbSet<ProjectFile> ProjectFiles { get; set; }
        public virtual DbSet<ProjectSupplier> ProjectSuppliers { get; set; }
        public virtual DbSet<ProjectNote> ProjectNotes { get; set; }
        //public virtual DbSet<ProjectBoard> ProjectBoards { get; set; }
        public virtual DbSet<ProjectAttribute> ProjectAttributes { get; set; }
        public virtual DbSet<Team> Teams { get; set; }
        public virtual DbSet<ProjectTeamUser> ProjectTeamUsers { get; set; }

        public virtual DbSet<ProjectCusSup> ProjectCusSups { get; set; }
        public virtual DbSet<PoSaleProductDetail> PoSaleProductDetails { get; set; }
        public virtual DbSet<ProjectService> ProjectServices { get; set; }
        public virtual DbSet<ProjectProduct> ProjectProducts { get; set; }

        /// <summary>
        /// Card
        /// </summary>
        public virtual DbSet<WORKOSBoard> WORKOSBoards { get; set; }
        public virtual DbSet<WORKOSList> WORKOSLists { get; set; }
        public virtual DbSet<WORKOSCard> WORKOSCards { get; set; }
        public virtual DbSet<CardItemCheck> CardItemChecks { get; set; }
        public virtual DbSet<CardSubitemCheck> CardSubitemChecks { get; set; }
        public virtual DbSet<CardAttachment> CardAttachments { get; set; }
        public virtual DbSet<CardCommentList> CardCommentLists { get; set; }
        public virtual DbSet<CardForWObj> CardForWObjs { get; set; }
        public virtual DbSet<CardMember> CardMembers { get; set; }
        public virtual DbSet<CardGroupUser> CardGroupUsers { get; set; }
        public virtual DbSet<CardUserActivity> CardUserActivitys { get; set; }
        public virtual DbSet<CardProduct> CardProducts { get; set; }
        public virtual DbSet<CardMapping> CardMappings { get; set; }
        public virtual DbSet<JcObjectType> JcObjectTypes { get; set; }
        public virtual DbSet<JcObjectIdRelative> JcObjectIdRelatives { get; set; }
        public virtual DbSet<JcProduct> JcProducts { get; set; }
        public virtual DbSet<JcService> JcServices { get; set; }
        public virtual DbSet<WORKItemSession> WORKItemSessions { get; set; }
        public virtual DbSet<WORKItemSessionResult> WORKItemSessionResults { get; set; }
        public virtual DbSet<WorkItemAssignStaff> WorkItemAssignStaffs { get; set; }
        public virtual DbSet<SessionItemChkItem> SessionItemChkItems { get; set; }
        public virtual DbSet<JobCardLink> JobCardLinks { get; set; }



        /// <summary>
        /// Candidate
        /// </summary>
        public virtual DbSet<CandidateBasic> CandiateBasic { get; set; }
        public virtual DbSet<CandidateWorkEvent> CandidateWorkEvents { get; set; }
        public virtual DbSet<CandidateInterview> CandidateInterviews { get; set; }

        /// <summary>
        /// Staff
        /// </summary>
        public virtual DbSet<CompanyScheduleWork> CompanyScheduleWorks { get; set; }
        public virtual DbSet<StaffScheduleWork> StaffScheduleWorks { get; set; }
        public virtual DbSet<WorkShiftCheckInOut> WorkShiftCheckInOuts { get; set; }
        public virtual DbSet<ShiftLog> ShiftLogs { get; set; }
        public virtual DbSet<UserDeclareBusyOrFree> UserDeclareBusyOrFrees { get; set; }

        /// <summary>
        /// Keyword
        /// </summary>
        public virtual DbSet<GalaxyKeyword> GalaxyKeywords { get; set; }

        /// <summary>
        /// Google API
        /// </summary>
        public virtual DbSet<ApiGoogleServices> ApiGoogleServices { get; set; }
        public virtual DbSet<CountRequestGoogle> CountRequestGoogle { get; set; }

        /// <summary>
        /// Addon app
        /// </summary>
        public virtual DbSet<AddonApp> AddonApps { get; set; }
        public virtual DbSet<AddonAppServer> AddonAppServers { get; set; }
        public virtual DbSet<AppVendor> AppVendors { get; set; }
        public virtual DbSet<HolidayDate> HolidayDates { get; set; }
        public virtual DbSet<MobiFunctionJobCardList> MobiFunctionJobCardLists { get; set; }

        /// <summary>
        /// Dispatches
        /// </summary>
        public virtual DbSet<DispatchesCategory> DispatchesCategorys { get; set; }
        public virtual DbSet<DispatchesHeader> DispatchesHeaders { get; set; }
        public virtual DbSet<DispatchTrackingProcess> DispatchTrackingProcesss { get; set; }
        public virtual DbSet<DispatchesMemberActivity> DispatchesMemberActivitys { get; set; }
        public virtual DbSet<DispatchesFileACT> DispatchesFileACTs { get; set; }
        public virtual DbSet<DispatchesCommentACT> DispatchesCommentACTs { get; set; }
        public virtual DbSet<DispatchesUser> DispatchesUsers { get; set; }
        public virtual DbSet<DispatchesWeekWorkingScheduler> DispatchesWeekWorkingSchedulerss { get; set; }


        /// <summary>
        /// Building
        /// </summary>
        public virtual DbSet<JCKMaterialsComsume> JCKMaterialsComsumes { get; set; }
        public virtual DbSet<JCTrackingBuilding> JCTrackingBuildings { get; set; }
        public virtual DbSet<JCTrackingMedia> JCTrackingMedias { get; set; }
        //public virtual DbSet<ProjectBuilding> ProjectBuildings { get; set; }


        //Face Id
        public virtual DbSet<FaceFaceId> FaceFaceIds { get; set; }

        public virtual DbSet<ObeListDevice> ObelistDevices { get; set; }
        public virtual DbSet<ObeAiRecognitionTracking> ObeAiRecognitionTrackings { get; set; }
        public virtual DbSet<ObeAccount> ObeAccounts { get; set; }


        //Vicem
        public virtual DbSet<VcSupplierTradeRelation> VcSupplierTradeRelations { get; set; }
        public virtual DbSet<VcTransporter> VcTransporters { get; set; }

        public virtual DbSet<VcProductCat> VcProductCats { get; set; }
        public virtual DbSet<VcWorkCheck> VcWorkChecks { get; set; }
        public virtual DbSet<VcSettingRoute> VcSettingRoutes { get; set; }
        public virtual DbSet<VcWorkPlan> VcWorkPlans { get; set; }
        public virtual DbSet<VcWorkPlanLog> VcWorkPlanLogs { get; set; }
        public virtual DbSet<VcCustomerCare> VcCustomerCares { get; set; }
        public virtual DbSet<VcLeaderApprove> VcLeaderApproves { get; set; }
        public virtual DbSet<VcStoreIdea> VcStoreIdeas { get; set; }
        public virtual DbSet<VcCustomerDeclareInfo> VcCustomerDeclareInfos { get; set; }
        public virtual DbSet<VcCustomerDeclareHeaderInfo> VcCustomerDeclareHeaderInfos { get; set; }
        public virtual DbSet<VcDriver> VcDrivers { get; set; }
        public virtual DbSet<VcSOSInfo> VcSOSInfos { get; set; }
        public virtual DbSet<VcSOSMedia> VcSOSMedias { get; set; }
        public virtual DbSet<VcFcm> VcFcms { get; set; }
        public virtual DbSet<VcFcmMessage> VcFcmMessages { get; set; }
        public virtual DbSet<VcAppAccessLog> VcAppAccessLogs { get; set; }
        public virtual DbSet<VcGisTable> VcGisTables { get; set; }
        public virtual DbSet<VcCustomerCareLastMonth> VcCustomerCareLastMonths { get; set; }

        //Tin nội bộ Vicem
        public virtual DbSet<VCJnanaFile> VCJnanaFiles { get; set; }
        public virtual DbSet<VCJnanaNewsArticle> VCJnanaNewsArticles { get; set; }
        public virtual DbSet<VCJnanaNewsArticleFile> VCJnanaNewsArticleFiles { get; set; }
        public virtual DbSet<VCJnanaNewsCat> VCJnanaNewsCats { get; set; }
        public virtual DbSet<VCJnanaFcm> VCJnanaFcms { get; set; }
        public virtual DbSet<VCJnanaFcmMessage> VCJnanaFcmMessages { get; set; }


        /// <summary>
        /// Facco
        /// </summary>
        public virtual DbSet<FacoProductCat> FacoProductCats { get; set; }
        public virtual DbSet<OperationOnlineSupport> OperationOnlineSupports { get; set; }
        public virtual DbSet<OperationOnlineSupportTracking> OperationOnlineSupportTrackings { get; set; }
        public virtual DbSet<SetCompanyMenu> SetCompanyMenus { get; set; }

        //public object Remooc_Fcm_Tokens { get; set; }
        public virtual DbSet<ProdPackageReceived> ProdPackageReceiveds { get; set; }
        public virtual DbSet<ProdPackageDelivery> ProdPackageDeliverys { get; set; }

        /// <summary>
        /// Romooc
        /// </summary>
        public virtual DbSet<RmSOSInfo> RmSOSInfos { get; set; }
        public virtual DbSet<RmGisTable> RmGisTables { get; set; }
        public virtual DbSet<RmSOSMedia> RmSOSMedias { get; set; }
        public virtual DbSet<RmJnanaFile> RmJnanaFiles { get; set; }
        public virtual DbSet<RmJnanaNewsArticle> RmJnanaNewsArticles { get; set; }
        public virtual DbSet<RmJnanaNewsArticleFile> RmJnanaNewsArticleFiles { get; set; }
        public virtual DbSet<RmJnanaNewsCat> RmJnanaNewsCats { get; set; }
        public virtual DbSet<RmJnanaFcm> RmJnanaFcms { get; set; }
        public virtual DbSet<RmJnanaFcmMessage> RmJnanaFcmMessages { get; set; }
        public virtual DbSet<RmRemoocCurrentPosition> RmRemoocCurrentPositions { get; set; }
        public virtual DbSet<RmRomoocExtrafield> RmRomoocExtrafields { get; set; }
        public virtual DbSet<RmRemoocPacking> RmRemoocPackings { get; set; }
        public virtual DbSet<RmRemoocRemooc> RmRemoocRemoocs { get; set; }
        public virtual DbSet<RmRemoocTracking> RmRemoocTrackings { get; set; }
        public virtual DbSet<RmRemoocTractor> RmRemoocTractors { get; set; }
        public virtual DbSet<RmRemoocFcm> RmRemoocFcms { get; set; }
        public virtual DbSet<RmRomoocDriver> RmRomoocDrivers { get; set; }
        public virtual DbSet<RmRemoocFcmMesage> RmRemoocFcmMesages { get; set; }
        public virtual DbSet<RmCommandOrderTruck> RmCommandOrderTrucks { get; set; }
        public virtual DbSet<RmECompany> RmECompanys { get; set; }
        public virtual DbSet<RmVayxeCatSevices> RmVayxeCatSevicess { get; set; }
        public virtual DbSet<RmVayxeTableCostHeader> RmVayxeTableCostHeaders { get; set; }
        public virtual DbSet<RmVayxeTableCostDetails> RmVayxeTableCostDetailss { get; set; }
        public virtual DbSet<RmVayxeBookChecking> RmVayxeBookCheckings { get; set; }
        public virtual DbSet<RmVayxeBookServiceDetails> RmVayxeBookServiceDetailss { get; set; }
        public virtual DbSet<RmVayxeBookMaterialDetails> RmVayxeBookMaterialDetailss { get; set; }
        public virtual DbSet<RmVayxeVendor> RmVayxeVendors { get; set; }
        public virtual DbSet<RmVayxeMaterialGoods> RmVayxeMaterialGoodss { get; set; }
        public virtual DbSet<RmJnanaApiGoogleServices> RmJnanaApiGoogleServicess { get; set; }
        public virtual DbSet<RmJnanaCountRequestGoogle> RmJnanaCountRequestGoogles { get; set; }
        public virtual DbSet<RmDriverActivityLog> RmDriverActivityLogs { get; set; }
        public virtual DbSet<RmHrEmployee> RmHrEmployees { get; set; }
        public virtual DbSet<RmCancelTracking> RmCancelTrackings { get; set; }
        public virtual DbSet<RmCommentSetting> RmCommentSettings { get; set; }

        public virtual DbSet<IconManager> IconManagers { get; set; }
        public virtual DbSet<SubProduct> SubProducts { get; set; }
        public virtual DbSet<ProductLotFile> ProductLotFiles { get; set; }

        public virtual DbSet<LotProduct> LotProducts { get; set; }
        public virtual DbSet<LotProductDetail> LotProductDetails { get; set; }
        public virtual DbSet<PoBuyerHeader> PoBuyerHeaders { get; set; }
        public virtual DbSet<PoBuyerHeaderNotDone> PoBuyerHeaderNotDones { get; set; }
        public virtual DbSet<PoBuyerHeaderPayment> PoBuyerHeaderPayments { get; set; }
        public virtual DbSet<PoBuyerDetail> PoBuyerDetails { get; set; }
        public virtual DbSet<PoSupUpdateTracking> PoSupUpdateTrackings { get; set; }
        public virtual DbSet<PoCusUpdateTracking> PoCusUpdateTrackings { get; set; }

        ///<summary>
        ///FUND
        ///</sumary>
        public virtual DbSet<FundAccEntry> FundAccEntrys { get; set; }
        public virtual DbSet<ParamForWarning> ParamForWarnings { get; set; }
        public virtual DbSet<FundExchagRate> FundExchagRates { get; set; }
        public virtual DbSet<FundCurrency> FundCurrencys { get; set; }
        public virtual DbSet<FundCatReptExps> FundCatReptExpss { get; set; }
        public virtual DbSet<FundFiles> FundFiless { get; set; }
        public virtual DbSet<FundAccEntryTracking> FundAccEntryTrackings { get; set; }
        public virtual DbSet<ProductCostDetail> ProductCostDetails { get; set; }
        public virtual DbSet<CostTableLog> CostTableLogs { get; set; }
        public virtual DbSet<ProductCostHeader> ProductCostHeaders { get; set; }
        public virtual DbSet<ProductQrCode> ProductQrCodes { get; set; }
        public virtual DbSet<FundRelativeObjMng> FundRelativeObjMngs { get; set; }
        public virtual DbSet<FundLoaddingSMSBank> FundLoaddingSMSBanks { get; set; }



        /// IOT_Table
        public virtual DbSet<IotCarInOut> IotCarInOuts { get; set; }
        public virtual DbSet<IotWarningSetting> IotWarningSettings { get; set; }
        public virtual DbSet<IotAnalysis_Action> IotAnalysis_Actions { get; set; }
        public virtual DbSet<IotSensor> IotSensors { get; set; }
        public virtual DbSet<IotSetUpAlert> IotSetUpAlerts { get; set; }

        ///Phần Share File
        public virtual DbSet<EDMSObjectShareFile> EDMSObjectShareFiles { get; set; }

        ///Phần Dịch Vụ
        ///
        public virtual DbSet<ServiceCategoryAttribute> ServiceCategoryAttributes { get; set; }
        public virtual DbSet<ServiceCategoryGroup> ServiceCategoryGroups { get; set; }
        public virtual DbSet<ServiceCategoryType> ServiceCategoryTypes { get; set; }
        public virtual DbSet<ServiceCategoryCostCondition> ServiceCategoryCostConditions { get; set; }
        public virtual DbSet<ServiceCategoryCostHeader> ServiceCategoryCostHeaders { get; set; }

        //Syncfusion
        public virtual DbSet<AseanDocument> AseanDocuments { get; set; }
        public virtual DbSet<LogChangeDocument> LogChangeDocuments { get; set; }

        /// <summary>
        /// Work Flow
        /// </summary>
        public virtual DbSet<Activity> Activitys { get; set; }
        public virtual DbSet<WfObject> WfObjects { get; set; }
        public virtual DbSet<WorkFlow> WorkFlows { get; set; }
        public virtual DbSet<WorkFlowRule> WorkFlowRules { get; set; }
        public virtual DbSet<ProgressTracking> ProgressTrackings { get; set; }
        /// <summary>
        /// Zoom Meeting
        /// </summary>
        public virtual DbSet<ZoomManage> ZoomManages { get; set; }

        /// <summary>
        /// Salary table
        /// </summary>
        public virtual DbSet<SalaryTableHeader> SalaryTableHeaders { get; set; }
        public virtual DbSet<SalaryTableDetail> SalaryTableDetails { get; set; }
        public virtual DbSet<SalaryTableAllowance> SalaryTableAllowances { get; set; }

        /// <summary>
        /// Danh sách đối tượng
        /// </summary>
        /// 
        public virtual DbSet<VAllObject> VAllObjects { get; set; }
        public virtual DbSet<VAmchartCountBuy> VAmchartCountBuys { get; set; }
        public virtual DbSet<VAmchartCountSale> VAmchartCountSales { get; set; }
        public virtual DbSet<VAmchartCountCustomer> VAmchartCountCustomers { get; set; }
        public virtual DbSet<VAmchartCountSupplier> VAmchartCountSuppliers { get; set; }
        public virtual DbSet<VAmchartCountProject> VAmchartCountProjects { get; set; }
        public virtual DbSet<VAmchartCountEmployee> VAmchartCountEmployees { get; set; }
        public virtual DbSet<VHighchartFund> VHighchartFunds { get; set; }
        public virtual DbSet<VHighchartProd> VHighchartProds { get; set; }
        public virtual DbSet<VListBoard> VListBoards { get; set; }
        public virtual DbSet<VCardProcess> VCardProcesss { get; set; }

        /// <summary>
        /// Urenco
        /// </summary>
        /// 
        public virtual DbSet<UrencoCarMaintenanceHeader> UrencoCarMaintenanceHeaders { get; set; }
        public virtual DbSet<UrencoCarMaintenanceMaterialDetail> UrencoCarMaintenanceMaterialDetails { get; set; }
        public virtual DbSet<UrencoCarMaintenanceServiceDetail> UrencoCarMaintenanceServiceDetails { get; set; }
        public virtual DbSet<UrencoCarCostHeader> UrencoCarCostHeaders { get; set; }
        public virtual DbSet<UrencoCarCostDetail> UrencoCarCostDetails { get; set; }

        public virtual DbSet<UrencoCostCategory> UrencoCostCategorys { get; set; }
        public virtual DbSet<UrencoCostCategoryAttribute> UrencoCostCategoryAttributes { get; set; }
        public virtual DbSet<UrencoCostGroup> UrencoCostGroups { get; set; }
        public virtual DbSet<UrencoCostType> UrencoCostTypes { get; set; }
        public virtual DbSet<UrencoCarManager> UrencoCarManagers { get; set; }
        

        #region Urenco
        public virtual DbSet<UrencoRoute> UrencoRoutes { get; set; }
        public virtual DbSet<UrencoTrashCar> UrencoTrashCars { get; set; }
        public virtual DbSet<UrencoNode> UrencoNodes { get; set; }
        public virtual DbSet<UrencoRubbishBin> UrencoRubbishBins { get; set; }
        public virtual DbSet<UrencoDriverMapping> UrencoDriverMappings { get; set; }
        public virtual DbSet<UrencoNodesRubbishMapping> UrencoNodesRubbishMapping { get; set; }
        public virtual DbSet<UrencoAssetsCategory> UrencoAssetsCategorys { get; set; }
        public virtual DbSet<UrencoMaterialProductGroup> UrencoMaterialProductGroup { get; set; }
        public virtual DbSet<UrencoArea> UrencoAreas { get; set; }
        public virtual DbSet<UrencoAreaRoute> UrencoAreaRoutes { get; set; }
        public virtual DbSet<UrencoAreaTeam> UrencoAreaTeams { get; set; }
        public virtual DbSet<UrencoCatActivity> UrencoCatActivitys { get; set; }
        public virtual DbSet<UrencoCatObjectType> UrencoCatObjectTypes { get; set; }
        public virtual DbSet<UrencoCatObjectActivity> UrencoCatObjectActivitys { get; set; }
        public virtual DbSet<UrencoDataWorking> UrencoDataWorkings { get; set; }
        public virtual DbSet<UrencoActivityCar> UrencoActivityCars { get; set; }
        public virtual DbSet<UrencoObjectImpact> UrencoObjectImpacts { get; set; }
        public virtual DbSet<UrencoObjectWorkspace> UrencoObjectWorkspaces { get; set; }
        public virtual DbSet<UrencoStreetworkerReport> UrencoStreetworkerReports { get; set; }
        public virtual DbSet<CommandTracking> CommandTrackings { get; set; }

        public virtual DbSet<UrencoTableVariable> UrencoTableVariables { get; set; }
        public virtual DbSet<UrencoBranchWorking> UrencoBranchWorkings { get; set; }
        public class UrencoTableVariable
        {
            [Key]
            public Guid Id { get; set; }
            public string Code { get; set; }
            public string Name { get; set; }
        }
        public virtual DbSet<Test> Tests { get; set; }
        public class Test
        {
            [Key]
            public Guid Id { get; set; }
            public string Code { get; set; }
            public string Name { get; set; }
        }
        #endregion
        /// <param name="modelBuilder"></param>
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            #region Builder entity

            modelBuilder.Entity<AspNetRole>(entity =>
            {
                entity.Property(e => e.Id).HasMaxLength(50).HasColumnName("RoleId");
                entity.Property(e => e.ConcurrencyStamp).HasMaxLength(255);
                entity.Property(e => e.Name).HasMaxLength(255);
                entity.Property(e => e.NormalizedName).HasMaxLength(255);

                entity.HasIndex(e => e.NormalizedName).HasName("IX_ROLES_NAME").IsUnique();
            });

            modelBuilder.Entity<AspNetUser>(entity =>
            {

                entity.Property(e => e.Id).HasMaxLength(50).HasColumnName("UserId");
                entity.Property(e => e.ConcurrencyStamp).HasMaxLength(50);
                entity.Property(e => e.PasswordHash).HasMaxLength(2000);
                entity.Property(e => e.SecurityStamp).HasMaxLength(50);
                entity.Property(e => e.PhoneNumber).HasMaxLength(100);

                entity.Property(e => e.Email).HasMaxLength(256);
                entity.Property(e => e.NormalizedEmail).HasMaxLength(256);

                entity.Property(e => e.UserName).IsRequired().HasMaxLength(256);
                entity.Property(e => e.NormalizedUserName).IsRequired().HasMaxLength(256);

                entity.HasIndex(e => e.NormalizedEmail).HasName("IX_USERS_EMAIL");
                entity.HasIndex(e => e.NormalizedUserName).HasName("IX_USERS_USER_NAME").IsUnique();

            });

            modelBuilder.Entity<AdApplication>(entity =>
            {

            });

            modelBuilder.Entity<AdFunction>(entity =>
            {

            });

            modelBuilder.Entity<AdAppFunction>(entity =>
            {

            });

            modelBuilder.Entity<AdGroupUser>(entity =>
            {

            });

            modelBuilder.Entity<AdOrganization>(entity =>
            {

            });

            modelBuilder.Entity<AdParameter>(entity =>
            {

            });

            modelBuilder.Entity<AdPermission>(entity =>
            {

            });

            modelBuilder.Entity<AdPrivilege>(entity =>
            {

            });

            modelBuilder.Entity<AdResource>(entity =>
            {

            });

            modelBuilder.Entity<AdUserInGroup>(entity =>
            {

            });
            #endregion

            base.OnModelCreating(modelBuilder);

            #region Replace all table, column name to snake case
            foreach (var entity in modelBuilder.Model.GetEntityTypes())
            {
                // Replace table names
                entity.Relational().TableName = entity.Relational().TableName.ToSnakeCase(true);

                // Replace column names            
                foreach (var property in entity.GetProperties())
                {
                    property.Relational().ColumnName = property.Name.ToSnakeCase(true);
                }

                foreach (var key in entity.GetKeys())
                {
                    key.Relational().Name = key.Relational().Name.ToSnakeCase(true);
                }

                foreach (var key in entity.GetForeignKeys())
                {
                    key.Relational().Name = key.Relational().Name.ToSnakeCase(true);
                }

                foreach (var index in entity.GetIndexes())
                {
                    index.Relational().Name = index.Relational().Name.ToSnakeCase(true);
                }
            }
            #endregion
        }
    }
}