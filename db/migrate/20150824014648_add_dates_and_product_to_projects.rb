class AddDatesAndProductToProjects < ActiveRecord::Migration[4.2]
  def change
    add_column :projects, :sched_start_date, :date
    add_column :projects, :actual_start_date, :date
    add_column :projects, :sched_completion_date, :date
    add_column :projects, :actual_completion_date, :date
    add_reference :projects, :product, index: true
  end
end
