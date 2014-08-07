class AddAcceptedAndStoryToIssue < ActiveRecord::Migration
  def change
    add_column :issues, :accepted, :boolean
    add_reference :issues, :story, index: true
  end
end
