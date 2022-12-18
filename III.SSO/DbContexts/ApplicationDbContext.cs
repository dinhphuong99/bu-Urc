using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Host.Entities;
using Microsoft.EntityFrameworkCore.Metadata;

namespace Host.DbContexts
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser, AspNetRole, string>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {

        }

        public virtual DbSet<ESEmailConfig> ESEmailConfigs { get; set; }
        public virtual DbSet<ESEmailInBox> ESEmailInBoxs { get; set; }

        public virtual DbSet<ESMessageAttribute> ESMessageAttributes { get; set; }
        public virtual DbSet<ESMessageQueue> ESMessageQueues { get; set; }
        public virtual DbSet<ESMessageReceiver> ESMessageReceivers { get; set; }
        public virtual DbSet<ESApiClient> ESApiClients { get; set; }
        //public virtual DbSet<AspNetRole> AspNetRoles { get; set; }
        public virtual DbSet<ESAccessLog> ESAccessLogs { get; set; }
        public virtual DbSet<ESAction> ESActions { get; set; }
        public virtual DbSet<ESAppGResource> ESAppGResources { get; set; }
        public virtual DbSet<ESApplication> ESApplications { get; set; }
        public virtual DbSet<ESClientConnect> ESClientConnects { get; set; }
        public virtual DbSet<ESEndpointApp> ESEndpointApps { get; set; }
        public virtual DbSet<ESEndpoint> ESEndpoints { get; set; }
        public virtual DbSet<ESExtendAccount> ESExtendAccounts { get; set; }
        public virtual DbSet<ESGroupParameter> ESGroupParameters { get; set; }
        public virtual DbSet<ESOauthClient> ESOauthClients { get; set; }
        public virtual DbSet<ESOrgApp> ESOrgApps { get; set; }
        public virtual DbSet<ESOrgPrivilege> ESOrgPrivileges { get; set; }
        public virtual DbSet<ESOrganization> ESOrganizations { get; set; }
        public virtual DbSet<ESParameter> ESParameter { get; set; }
        public virtual DbSet<ESPolicy> ESPolicies { get; set; }
        public virtual DbSet<ESPrivilege> ESPrivileges { get; set; }
        public virtual DbSet<ESResAttribute> ESResAttributes { get; set; }
        public virtual DbSet<ESGroupResource> ESGroupResources { get; set; }
        public virtual DbSet<ESResource> ESResources { get; set; }
        public virtual DbSet<ESRoleApp> ESRoleApps { get; set; }
        public virtual DbSet<ESRolePrivilege> ESRolePrivileges { get; set; }
        public virtual DbSet<ESUserApp> ESUserApps { get; set; }
        public virtual DbSet<ESUserPrivilege> ESUserPrivileges { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {


            modelBuilder.Entity<ESEmailConfig>(entity =>
            {
                entity.ToTable("ESEmailConfigs");

                entity.Property(e => e.Code)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(e => e.Email)
                    .IsRequired()
                    .HasMaxLength(255);

                entity.Property(e => e.Imap)
                    .HasColumnName("IMAP")
                    .HasMaxLength(255);

                entity.Property(e => e.Imapport).HasColumnName("IMAPPort");

                entity.Property(e => e.Password).HasMaxLength(255);

                entity.Property(e => e.Pop3)
                    .HasColumnName("POP3")
                    .HasMaxLength(255);

                entity.Property(e => e.Pop3port).HasColumnName("POP3Port");

                entity.Property(e => e.Smtp)
                    .HasColumnName("SMTP")
                    .HasMaxLength(255);

                entity.Property(e => e.Smtpport).HasColumnName("SMTPPort");

                entity.Property(e => e.Title)
                    .IsRequired()
                    .HasMaxLength(255);
            });

            modelBuilder.Entity<ESEmailInBox>(entity =>
            {
                entity.ToTable("ESEmailInBoxs");

                entity.Property(e => e.Body).HasColumnType("ntext");

                entity.Property(e => e.From).HasMaxLength(255);

                entity.Property(e => e.IdEmail).HasMaxLength(255);

                //entity.Property(e => e.SendDate).HasColumnType("datetime");

                entity.Property(e => e.Subject).HasMaxLength(255);

                entity.Property(e => e.To).HasMaxLength(255);
            });


            modelBuilder.Entity<ESApiClient>(entity =>
            {
                entity.ToTable("ESApiClients");

                entity.Property(e => e.Description).HasMaxLength(500);

                entity.Property(e => e.Name)
                    .IsRequired()
                    .HasMaxLength(255);

                entity.Property(e => e.Scopes).HasMaxLength(255);

                entity.Property(e => e.Secret).HasMaxLength(255);

                entity.Property(e => e.Title)
                    .IsRequired()
                    .HasMaxLength(255);
            });
            modelBuilder.Entity<ESMessageAttribute>(entity =>
            {
                entity.ToTable("ESMessageAttribute");

                entity.Property(e => e.Key)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(e => e.Value)
                    .IsRequired()
                    .HasMaxLength(255);

                entity.HasOne(d => d.MessageQueue)
                    .WithMany(p => p.ESMessageAttributes)
                    .HasForeignKey(d => d.MessageQueueId)
                    .OnDelete(DeleteBehavior.Restrict)
                    .HasConstraintName("FK_ESMessageAttribute_ESMessageQueue");
            });

            modelBuilder.Entity<ESMessageQueue>(entity =>
            {
                entity.ToTable("ESMessageQueue");

                //entity.Property(e => e.CreatedDate).HasColumnType("datetime");

                entity.Property(e => e.Subject).HasMaxLength(255);
            });

            modelBuilder.Entity<ESMessageReceiver>(entity =>
            {
                entity.ToTable("ESMessageReceiver");

                entity.Property(e => e.Email).HasMaxLength(255);

                entity.Property(e => e.Mobile).HasMaxLength(20);

                //entity.Property(e => e.S1).HasDefaultValueSql("0");

                //entity.Property(e => e.S2).HasDefaultValueSql("0");

                entity.HasOne(d => d.MessageQueue)
                    .WithMany(p => p.ESMessageReceivers)
                    .HasForeignKey(d => d.MessageQueueId)
                    .OnDelete(DeleteBehavior.Restrict)
                    .HasConstraintName("FK_ESMessageReceiver_ESMessageQueue");
            });

            //modelBuilder.Entity<AspNetRole>(entity =>
            //{
            //    entity.ToTable("AspNetRole");

            //    entity.Property(e => e.Id).HasColumnType("varchar(250)");
            //});

            modelBuilder.Entity<ESAccessLog>(entity =>
            {
                entity.ToTable("ESAccessLogs");

                //entity.Property(e => e.AccessDate).HasColumnType("datetime");

                entity.Property(e => e.Action)
                    .IsRequired()
                    .HasColumnType("varchar(50)");

                entity.Property(e => e.Application)
                    .IsRequired()
                    .HasMaxLength(255);

                entity.Property(e => e.Description).HasMaxLength(450);

                entity.Property(e => e.Ipaddress)
                    .HasColumnName("IPAddress")
                    .HasColumnType("varchar(50)");

                entity.Property(e => e.Resource)
                    .IsRequired()
                    .HasMaxLength(255);

                entity.Property(e => e.UserId)
                    .IsRequired()
                    .HasMaxLength(250);
            });

            modelBuilder.Entity<ESAction>(entity =>
            {
                entity.ToTable("ESActions");

                entity.Property(e => e.Id).HasColumnType("varchar(50)");

                entity.Property(e => e.Description).HasMaxLength(255);

                entity.Property(e => e.Title)
                    .IsRequired()
                    .HasMaxLength(255);
            });

            modelBuilder.Entity<ESAppGResource>(entity =>
            {
                entity.HasKey(e => new { e.ApplicationId, e.GroupResourceId })
                    .HasName("PK_ESAppResources");

                entity.ToTable("ESAppGResources");

                entity.HasOne(d => d.Application)
                    .WithMany(p => p.ESAppResources)
                    .HasForeignKey(d => d.ApplicationId)
                    .HasConstraintName("FK_ESAppResources_ESApplications");

                entity.HasOne(d => d.GroupResource)
                    .WithMany(p => p.ESAppResources)
                    .HasForeignKey(d => d.GroupResourceId)
                    .HasConstraintName("FK_ESAppGResources_ESResources");
            });

            modelBuilder.Entity<ESApplication>(entity =>
            {
                entity.ToTable("ESApplications");

                entity.HasIndex(e => e.Code)
                    .HasName("IX_ESApplications")
                    .IsUnique();

                entity.Property(e => e.AuthenticationScheme).HasMaxLength(255);

                entity.Property(e => e.Authority).HasMaxLength(255);

                entity.Property(e => e.ClientId).HasMaxLength(255);

                entity.Property(e => e.ClientSecret).HasMaxLength(255);

                entity.Property(e => e.Code)
                    .IsRequired()
                    .HasMaxLength(255);

                entity.Property(e => e.NameClaimType).HasMaxLength(255);

                entity.Property(e => e.ResponseType).HasMaxLength(255);

                entity.Property(e => e.RoleClaimType).HasMaxLength(255);

                entity.Property(e => e.Scope).HasMaxLength(255);

                entity.Property(e => e.Title)
                    .IsRequired()
                    .HasMaxLength(255);
            });

            modelBuilder.Entity<ESClientConnect>(entity =>
            {
                entity.ToTable("ESClientConnects");

                //entity.Property(e => e.ConnectDate).HasColumnType("datetime");

                //entity.Property(e => e.DisconnectDate).HasColumnType("datetime");

                entity.Property(e => e.Ipaddress)
                    .HasColumnName("IPAddress")
                    .HasColumnType("varchar(50)");
            });

            modelBuilder.Entity<ESEndpointApp>(entity =>
            {
                entity.HasKey(e => new { e.EndpointId, e.ApplicationId })
                    .HasName("PK_ESEndpointApps");

                entity.ToTable("ESEndpointApps");

                entity.HasOne(d => d.Application)
                    .WithMany(p => p.ESEndpointApps)
                    .HasForeignKey(d => d.ApplicationId)
                    .HasConstraintName("FK_ESEndpointApps_ESApplications");

                entity.HasOne(d => d.Endpoint)
                    .WithMany(p => p.ESEndpointApps)
                    .HasForeignKey(d => d.EndpointId)
                    .HasConstraintName("FK_ESEndpointApps_ESEndpoints");
            });

            modelBuilder.Entity<ESEndpoint>(entity =>
            {
                entity.ToTable("ESEndpoints");

                entity.Property(e => e.Description).HasMaxLength(1000);

                entity.Property(e => e.Ipaddress)
                    .IsRequired()
                    .HasColumnName("IPAddress")
                    .HasColumnType("varchar(50)");

                entity.Property(e => e.Title)
                    .IsRequired()
                    .HasMaxLength(255);
            });

            modelBuilder.Entity<ESExtendAccount>(entity =>
            {
                entity.ToTable("ESExtendAccounts");

                entity.Property(e => e.Account)
                    .IsRequired()
                    .HasMaxLength(255);

                entity.Property(e => e.Type)
                    .IsRequired()
                    .HasColumnType("varchar(50)");

                entity.Property(e => e.UserId).HasMaxLength(250);


            });

            modelBuilder.Entity<ESGroupParameter>(entity =>
            {
                entity.ToTable("ESGroupParameters");

                entity.Property(e => e.Description).HasMaxLength(500);

                entity.Property(e => e.Title)
                    .IsRequired()
                    .HasMaxLength(250);
            });

            modelBuilder.Entity<ESOauthClient>(entity =>
            {
                entity.ToTable("ESOAuthClients");

                entity.HasIndex(e => e.ClientId)
                    .HasName("IX_ESOAuthClients")
                    .IsUnique();

                entity.Property(e => e.AllowedScopes).HasMaxLength(255);

                entity.Property(e => e.ClientId)
                    .IsRequired()
                    .HasMaxLength(255);

                entity.Property(e => e.ClientSecret)
                    .IsRequired()
                    .HasMaxLength(255);

                entity.Property(e => e.Description).HasMaxLength(255);

                entity.Property(e => e.GrantTypes)
                    .IsRequired()
                    .HasMaxLength(255);

                entity.Property(e => e.Logo).HasMaxLength(255);

                entity.Property(e => e.PostLogoutRedirectUris).HasMaxLength(255);

                entity.Property(e => e.RedirectUris).HasMaxLength(255);

                entity.Property(e => e.Title)
                    .IsRequired()
                    .HasMaxLength(255);
            });

            modelBuilder.Entity<ESOrgApp>(entity =>
            {
                entity.HasKey(e => new { e.OrgId, e.ApplicationId })
                    .HasName("PK_ESOrgApps");

                entity.ToTable("ESOrgApps");

                entity.HasOne(d => d.Application)
                    .WithMany(p => p.ESOrgApps)
                    .HasForeignKey(d => d.ApplicationId)
                    .HasConstraintName("FK_ESOrgApps_ESApplications");

                entity.HasOne(d => d.Org)
                    .WithMany(p => p.ESOrgApps)
                    .HasForeignKey(d => d.OrgId)
                    .HasConstraintName("FK_ESOrgApps_ESOrganizations");
            });

            modelBuilder.Entity<ESOrgPrivilege>(entity =>
            {
                entity.HasKey(e => new { e.OrgId, e.PrivilegeId })
                    .HasName("PK_ESOrgPrivileges");

                entity.ToTable("ESOrgPrivileges");

                entity.HasOne(d => d.Org)
                    .WithMany(p => p.ESOrgPrivileges)
                    .HasForeignKey(d => d.OrgId)
                    .HasConstraintName("FK_ESOrgPrivileges_ESOrganizations");

                entity.HasOne(d => d.Privilege)
                    .WithMany(p => p.ESOrgPrivileges)
                    .HasForeignKey(d => d.PrivilegeId)
                    .HasConstraintName("FK_ESOrgPrivileges_ESPrivileges");
            });

            modelBuilder.Entity<ESOrganization>(entity =>
            {
                entity.ToTable("ESOrganizations");

                entity.Property(e => e.Code)
                    .IsRequired()
                    .HasMaxLength(255);

                entity.Property(e => e.Description).HasMaxLength(1000);

                entity.Property(e => e.Title)
                    .IsRequired()
                    .HasMaxLength(255);

                entity.HasOne(d => d.Parent)
                    .WithMany(p => p.InverseParent)
                    .HasForeignKey(d => d.ParentId)
                    .HasConstraintName("FK_ESOrganizations_ESOrganizations");
            });

            modelBuilder.Entity<ESParameter>(entity =>
            {
                entity.ToTable("ESParameters");

                entity.Property(e => e.Code)
                    .IsRequired()
                    .HasMaxLength(525);

                entity.Property(e => e.Description).HasMaxLength(500);

                entity.Property(e => e.Title)
                    .IsRequired()
                    .HasMaxLength(250);

                entity.Property(e => e.Value).HasMaxLength(525);

                entity.HasOne(d => d.Group)
                    .WithMany(p => p.ESParameters)
                    .HasForeignKey(d => d.GroupId)
                    .HasConstraintName("FK_ESParameters_ESGroupParameters");

                entity.HasOne(d => d.Parent)
                    .WithMany(p => p.InverseParent)
                    .HasForeignKey(d => d.ParentId)
                    .HasConstraintName("FK_ESParameters_ESParameters");
            });

            modelBuilder.Entity<ESPolicy>(entity =>
            {
                entity.ToTable("ESPolicies");

                entity.Property(e => e.Id).HasColumnType("varchar(50)");

                entity.Property(e => e.Description).HasMaxLength(500);

                entity.Property(e => e.Title)
                    .IsRequired()
                    .HasMaxLength(255);

                entity.Property(e => e.Value)
                    .IsRequired()
                    .HasMaxLength(255);
            });

            modelBuilder.Entity<ESPrivilege>(entity =>
            {
                entity.ToTable("ESPrivileges");

                entity.Property(e => e.Id).ValueGeneratedNever();

                entity.Property(e => e.ActionId)
                    .IsRequired()
                    .HasColumnType("varchar(50)");

                entity.HasOne(d => d.Action)
                    .WithMany(p => p.ESPrivileges)
                    .HasForeignKey(d => d.ActionId)
                    .HasConstraintName("FK_ESPrivileges_ESActions");

                entity.HasOne(d => d.Resource)
                    .WithMany(p => p.ESPrivileges)
                    .HasForeignKey(d => d.ResourceId)
                    .HasConstraintName("FK_ESPrivileges_ESResources");
            });

            modelBuilder.Entity<ESResAttribute>(entity =>
            {
                entity.ToTable("ESResAttributes");

                entity.Property(e => e.Key)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(e => e.Value)
                    .IsRequired()
                    .HasMaxLength(255);

                entity.HasOne(d => d.Resource)
                    .WithMany(p => p.ESResAttributes)
                    .HasForeignKey(d => d.ResourceId)
                    .HasConstraintName("FK_ESResAttributes_ESResources");
            });

            modelBuilder.Entity<ESGroupResource>(entity =>
            {
                entity.ToTable("ESGroupResources");

                entity.Property(e => e.Id).HasMaxLength(50);

                entity.Property(e => e.Title)
                    .IsRequired()
                    .HasMaxLength(255);
            });

            modelBuilder.Entity<ESResource>(entity =>
            {
                entity.ToTable("ESResources");

                entity.Property(e => e.Id).ValueGeneratedNever();

                entity.Property(e => e.Code)
                    .IsRequired()
                    .HasMaxLength(255);

                entity.Property(e => e.Title)
                    .IsRequired()
                    .HasMaxLength(255);

                entity.Property(e => e.GroupResourceId)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.HasOne(d => d.Parent)
                    .WithMany(p => p.InverseParent)
                    .HasForeignKey(d => d.ParentId)
                    .HasConstraintName("FK_ESResources_ESResources");

                entity.HasOne(d => d.TypeNavigation)
                    .WithMany(p => p.ESResources)
                    .HasForeignKey(d => d.GroupResourceId)
                    .OnDelete(DeleteBehavior.Restrict)
                    .HasConstraintName("FK_ESResources_ESResTypes");
            });

            modelBuilder.Entity<ESRoleApp>(entity =>
            {
                entity.HasKey(e => new { e.RoleId, e.ApplicationId })
                    .HasName("PK_ESRoleAPps");

                entity.ToTable("ESRoleApps");

                entity.Property(e => e.RoleId).HasMaxLength(250);

                entity.HasOne(d => d.Application)
                    .WithMany(p => p.ESRoleApps)
                    .HasForeignKey(d => d.ApplicationId)
                    .HasConstraintName("FK_ESRoleAPps_ESApplications");

                entity.HasOne(d => d.Role)
                    .WithMany(p => p.ESRoleApps)
                    .HasForeignKey(d => d.RoleId)
                    .HasConstraintName("FK_ESRoleAPps_AspNetRoles");
            });

            modelBuilder.Entity<ESRolePrivilege>(entity =>
            {
                entity.HasKey(e => new { e.RoleId, e.PrivilegeId })
                    .HasName("PK_ESRolePrivileges");

                entity.ToTable("ESRolePrivileges");

                entity.Property(e => e.RoleId).HasMaxLength(250);

                entity.HasOne(d => d.Privilege)
                    .WithMany(p => p.ESRolePrivileges)
                    .HasForeignKey(d => d.PrivilegeId)
                    .HasConstraintName("FK_ESRolePrivileges_ESPrivileges");

                entity.HasOne(d => d.Role)
                    .WithMany(p => p.ESRolePrivileges)
                    .HasForeignKey(d => d.RoleId)
                    .HasConstraintName("FK_ESRolePrivileges_AspNetRoles");
            });

            modelBuilder.Entity<ESUserApp>(entity =>
            {
                entity.HasKey(e => new { e.UserId, e.ApplicationId })
                    .HasName("PK_ESUserApps");

                entity.ToTable("ESUserApps");

                entity.Property(e => e.UserId).HasMaxLength(250);

                entity.HasOne(d => d.Application)
                    .WithMany(p => p.ESUserApps)
                    .HasForeignKey(d => d.ApplicationId)
                    .HasConstraintName("FK_ESUserApps_ESApplications");


            });

            modelBuilder.Entity<ESUserPrivilege>(entity =>
            {
                entity.HasKey(e => new { e.UserId, e.PrivilegeId })
                    .HasName("PK_ESUserPrivileges");

                entity.ToTable("ESUserPrivileges");

                entity.Property(e => e.UserId).HasMaxLength(250);

                entity.HasOne(d => d.Privilege)
                    .WithMany(p => p.ESUserPrivileges)
                    .HasForeignKey(d => d.PrivilegeId)
                    .HasConstraintName("FK_ESUserPrivileges_ESPrivileges");


            });
            base.OnModelCreating(modelBuilder);

        }

    }
}