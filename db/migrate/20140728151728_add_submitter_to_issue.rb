class AddSubmitterToIssue < ActiveRecord::Migration
  def change
    add_column :issues, :submitter_email, :string
    add_column :issues, :submitter_full_name, :string
  end
end
