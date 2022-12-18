using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Host.Entities;
using Microsoft.EntityFrameworkCore.Metadata;
using ESEIM.Models;
using AspNetRole = Host.Entities.AspNetRole;
using III.Domain.Common;

namespace Host.DbContexts
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser, AspNetRole, string>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }
        public virtual DbSet<AdParameter> AdParameter { get; set; }
        public virtual DbSet<ESEmailConfig> ESEmailConfigs { get; set; }
        public virtual DbSet<ESEmailInBox> ESEmailInBoxs { get; set; }

        public virtual DbSet<ESMessageAttribute> ESMessageAttributes { get; set; }
        public virtual DbSet<ESMessageQueue> ESMessageQueues { get; set; }
        public virtual DbSet<ESMessageReceiver> ESMessageReceivers { get; set; }
        //public virtual DbSet<ESApiClient> ESApiClients { get; set; }
        ////public virtual DbSet<AspNetRole> AspNetRoles { get; set; }
        //public virtual DbSet<ESAccessLog> ESAccessLogs { get; set; }
        //public virtual DbSet<ESAction> ESActions { get; set; }
        //public virtual DbSet<ESAppGResource> ESAppGResources { get; set; }
        //public virtual DbSet<ESApplication> ESApplications { get; set; }
        //public virtual DbSet<ESClientConnect> ESClientConnects { get; set; }
        //public virtual DbSet<ESEndpointApp> ESEndpointApps { get; set; }
        //public virtual DbSet<ESEndpoint> ESEndpoints { get; set; }
        //public virtual DbSet<ESExtendAccount> ESExtendAccounts { get; set; }
        //public virtual DbSet<ESGroupParameter> ESGroupParameters { get; set; }
        //public virtual DbSet<ESOauthClient> ESOauthClients { get; set; }
        //public virtual DbSet<ESOrgApp> ESOrgApps { get; set; }
        //public virtual DbSet<ESOrgPrivilege> ESOrgPrivileges { get; set; }
        //public virtual DbSet<ESOrganization> ESOrganizations { get; set; }
        //public virtual DbSet<VIBParameter> VIBParameter { get; set; }
        //public virtual DbSet<ESPolicy> ESPolicies { get; set; }
        //public virtual DbSet<ESPrivilege> ESPrivileges { get; set; }
        //public virtual DbSet<ESResAttribute> ESResAttributes { get; set; }
        //public virtual DbSet<ESGroupResource> ESGroupResources { get; set; }
        //public virtual DbSet<ESResource> ESResources { get; set; }
        //public virtual DbSet<ESRoleApp> ESRoleApps { get; set; }
        //public virtual DbSet<ESRolePrivilege> ESRolePrivileges { get; set; }
        //public virtual DbSet<ESUserApp> ESUserApps { get; set; }
        //public virtual DbSet<ESUserPrivilege> ESUserPrivileges { get; set; }
        public virtual DbSet<ESEIM.Models.AdAccessLog> AdAccessLogs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {


            //modelBuilder.Entity<ESEmailConfig>(entity =>
            //{
            //    entity.ToTable("ESEmailConfigs");

            //    entity.Property(e => e.Code)
            //        .IsRequired()
            //        .HasMaxLength(50);

            //    entity.Property(e => e.Email)
            //        .IsRequired()
            //        .HasMaxLength(255);

            //    entity.Property(e => e.Imap)
            //        .HasColumnName("IMAP")
            //        .HasMaxLength(255);

            //    entity.Property(e => e.Imapport).HasColumnName("IMAPPort");

            //    entity.Property(e => e.Password).HasMaxLength(255);

            //    entity.Property(e => e.Pop3)
            //        .HasColumnName("POP3")
            //        .HasMaxLength(255);

            //    entity.Property(e => e.Pop3port).HasColumnName("POP3Port");

            //    entity.Property(e => e.Smtp)
            //        .HasColumnName("SMTP")
            //        .HasMaxLength(255);

            //    entity.Property(e => e.Smtpport).HasColumnName("SMTPPort");

            //    entity.Property(e => e.Title)
            //        .IsRequired()
            //        .HasMaxLength(255);
            //});

            //modelBuilder.Entity<ESEmailInBox>(entity =>
            //{
            //    entity.ToTable("ESEmailInBoxs");

            //    entity.Property(e => e.Body).HasColumnType("ntext");

            //    entity.Property(e => e.From).HasMaxLength(255);

            //    entity.Property(e => e.IdEmail).HasMaxLength(255);

            //    //entity.Property(e => e.SendDate).HasColumnType("datetime");

            //    entity.Property(e => e.Subject).HasMaxLength(255);

            //    entity.Property(e => e.To).HasMaxLength(255);
            //});


            ////modelBuilder.Entity<ESApiClient>(entity =>
            ////{
            ////    entity.ToTable("ESApiClients");

            ////    entity.Property(e => e.Description).HasMaxLength(500);

            ////    entity.Property(e => e.Name)
            ////        .IsRequired()
            ////        .HasMaxLength(255);

            ////    entity.Property(e => e.Scopes).HasMaxLength(255);

            ////    entity.Property(e => e.Secret).HasMaxLength(255);

            ////    entity.Property(e => e.Title)
            ////        .IsRequired()
            ////        .HasMaxLength(255);
            ////});
            //modelBuilder.Entity<ESMessageAttribute>(entity =>
            //{
            //    entity.ToTable("ESMessageAttribute");

            //    entity.Property(e => e.Key)
            //        .IsRequired()
            //        .HasMaxLength(50);

            //    entity.Property(e => e.Value)
            //        .IsRequired()
            //        .HasMaxLength(255);

            //    entity.HasOne(d => d.MessageQueue)
            //        .WithMany(p => p.ESMessageAttributes)
            //        .HasForeignKey(d => d.MessageQueueId)
            //        .OnDelete(DeleteBehavior.Restrict)
            //        .HasConstraintName("FK_ESMessageAttribute_ESMessageQueue");
            //});

            //modelBuilder.Entity<ESMessageQueue>(entity =>
            //{
            //    entity.ToTable("ESMessageQueue");

            //    //entity.Property(e => e.CreatedDate).HasColumnType("datetime");

            //    entity.Property(e => e.Subject).HasMaxLength(255);
            //});

            //modelBuilder.Entity<ESMessageReceiver>(entity =>
            //{
            //    entity.ToTable("ESMessageReceiver");

            //    entity.Property(e => e.Email).HasMaxLength(255);

            //    entity.Property(e => e.Mobile).HasMaxLength(20);

            //    //entity.Property(e => e.S1).HasDefaultValueSql("0");

            //    //entity.Property(e => e.S2).HasDefaultValueSql("0");

            //    entity.HasOne(d => d.MessageQueue)
            //        .WithMany(p => p.ESMessageReceivers)
            //        .HasForeignKey(d => d.MessageQueueId)
            //        .OnDelete(DeleteBehavior.Restrict)
            //        .HasConstraintName("FK_ESMessageReceiver_ESMessageQueue");
            //});               

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