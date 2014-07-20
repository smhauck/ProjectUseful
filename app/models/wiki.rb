class Wiki < ActiveRecord::Base
  has_many :pages, class_name: "WikiPage"
  belongs_to :product
end
