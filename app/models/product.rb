class Product < ActiveRecord::Base
  has_many :projects
  has_many :stories
  has_many :wikis
  has_many :wiki_pages
end
