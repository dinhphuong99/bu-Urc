﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("PROD_RECEIVED_HEADER")]
    public class ProdReceivedHeader
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string TicketCode { get; set; }

        [StringLength(255)]
        public string LotProductCode { get; set; }

        [StringLength(100)]
        public string CusCode { get; set; }

        [StringLength(100)]
        public string StoreCode { get; set; }

        [StringLength(255)]
        public string Title { get; set; }

        [StringLength(50)]
        public string UserImport { get; set; }

        [StringLength(50)]
        public string UserSend { get; set; }

        public decimal? CostTotal { get; set; }

        [StringLength(50)]
        public string Currency { get; set; }

        public decimal? Discount { get; set; }

        public decimal? Commission { get; set; }

        public decimal? TaxTotal { get; set; }

        [StringLength(500)]
        public string Note { get; set; }

        [StringLength(255)]
        public string PositionGps { get; set; }

        [StringLength(255)]
        public string PositionText { get; set; }

        [StringLength(50)]
        public string FromDevice { get; set; }

        public decimal? TotalPayed { get; set; }

        public decimal? TotalMustPayment { get; set; }

        public DateTime? InsurantTime { get; set; }

        public DateTime? TimeTicketCreate { get; set; }

        public DateTime? NextTimePayment { get; set; }

        [StringLength(500)]
        public string Reason { get; set; }

        [StringLength(100)]
        public string StoreCodeSend { get; set; }

        [StringLength(50)]
        public string PaymentStatus { get; set; }

        [StringLength(50)]
        public string CreatedBy { get; set; }

        public DateTime CreatedTime { get; set; }

        [StringLength(50)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        [StringLength(50)]
        public string DeletedBy { get; set; }

        public DateTime? DeletedTime { get; set; }

        public bool IsDeleted { get; set; }

        public string LogData { get; set; }
    }

    public class MaterialStoreImpGoodsHeaderModel
    {
        public int Id { get; set; }

        public string TicketCode { get; set; }

        public string LotProductCode { get; set; }

        public string CusCode { get; set; }

        public string StoreCode { get; set; }

        public string Title { get; set; }

        public string UserImport { get; set; }

        public string UserSend { get; set; }

        public decimal? CostTotal { get; set; }

        public string Currency { get; set; }

        public decimal? Discount { get; set; }

        public decimal? Commission { get; set; }

        public decimal? TaxTotal { get; set; }

        public string Note { get; set; }

        public string PositionGps { get; set; }

        public string PositionText { get; set; }

        public string FromDevice { get; set; }

        public decimal? TotalPayed { get; set; }
        public decimal? TotalMustPayment { get; set; }

        public string InsurantTime { get; set; }
        public string TimeTicketCreate { get; set; }
        public string NextTimePayment { get; set; }

        public string Reason { get; set; }

        public string StoreCodeReceipt { get; set; }

        public string PaymentStatus { get; set; }
    }

    public class MaterialStoreImpGoodsHeaderExport
    {
        public string TicketCode { get; set; }
        public string LotProductCode { get; set; }
        public string CusCode { get; set; }
        public string StoreCode { get; set; }
        public string Title { get; set; }
        public string UserImport { get; set; }
        public string UserSend { get; set; }
        public decimal? CostTotal { get; set; }
        public string Currency { get; set; }
        public decimal? Discount { get; set; }
        public decimal? Commission { get; set; }
        public decimal? TaxTotal { get; set; }
        public string Note { get; set; }
        public string PositionGps { get; set; }
        public string PositionText { get; set; }
        public string FromDevice { get; set; }
        public decimal? TotalPayed { get; set; }
        public decimal? TotalMustPayment { get; set; }
        public DateTime? InsurantTime { get; set; }
        public DateTime? TimeTicketCreate { get; set; }
        public DateTime? NextTimePayment { get; set; }
        public string Reason { get; set; }
        public string StoreCodeSend { get; set; }
        public string PaymentStatus { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedTime { get; set; }
    }
}
