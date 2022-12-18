﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("URENCO_CAR_COST_DETAIL")]
    public class UrencoCarCostDetail
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string CostCode { get; set; }
        public string ItemCode { get; set; }
        public string ItemType { get; set; }
        public int? Quantity { get; set; }
        public decimal? Cost { get; set; }
        public decimal? Total { get; set; }
        public string Unit { get; set; }
        public string Note { get; set; }
        public string CreatedBy { get; set; }
        public DateTime? CreatedDate { get; set; }
        public DateTime? CreatedTime { get; set; }
        public string UpdatedBy { get; set; }
        public DateTime? UpdatedTime { get; set; }
        public string DeletedBy { get; set; }
        public DateTime? DeletedTime { get; set; }
        public bool IsDeleted { get; set; }
    }

    public class UrencoCarCostDetailModel
    {
        public string CostCode { get; set; }
        public string ItemCode { get; set; }
        public string ItemType { get; set; }
        public int? Quantity { get; set; }
        public decimal? Cost { get; set; }
        public decimal? Total { get; set; }
        public string Unit { get; set; }
        public string Note { get; set; }
        public string CreatedDate { get; set; }
    }
}
