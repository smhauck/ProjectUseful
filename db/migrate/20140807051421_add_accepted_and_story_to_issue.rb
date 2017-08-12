class AddAcceptedAndStoryToIssue < ActiveRecord::Migration[4.2]
  def change
    add_column :issues, :accepted, :boolean
    add_reference :issues, :story, index: true
  end
end
