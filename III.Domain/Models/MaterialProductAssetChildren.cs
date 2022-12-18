﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("MATERIAL_PRODUCT_ASSET_CHILDREN")]
    public class MaterialProductAssetChildren
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(100)]
        public string Code { get; set; }

        [StringLength(255)]
        public string Name { get; set; }

        [StringLength(255)]
        public string Type { get; set; }

        [StringLength(255)]
        public string ParentCode { get; set; }

        [StringLength(500)]
        public string Description { get; set; }

        [StringLength(50)]
        public string CreatedBy { get; set; }

        [StringLength(50)]
        public string UpdatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }

        public DateTime? UpdatedTime { get; set; }

        [StringLength(50)]
        public string DeletedBy { get; set; }

        public DateTime? DeletedTime { get; set; }

        public bool IsDeleted { get; set; }
    }
}