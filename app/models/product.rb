class Product < ActiveRecord::Base
  has_many :stories
  has_many :notes
  has_many :wikis
  has_many :wiki_pages
  belongs_to :status, class_name: "ProductStatusType", foreign_key: "product_status_type_id"
  belongs_to :owner, class_name: "User", foreign_key: "owner_id"
end
