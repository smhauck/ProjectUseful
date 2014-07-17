class WikiPage < ActiveRecord::Base
  belongs_to :Product
  belongs_to :Project
  belongs_to :Story
  belongs_to :Task
  belongs_to :User
end
