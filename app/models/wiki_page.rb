class WikiPage < ActiveRecord::Base
  belongs_to :wiki
  belongs_to :product
  belongs_to :story
  belongs_to :task
  belongs_to :user
end
